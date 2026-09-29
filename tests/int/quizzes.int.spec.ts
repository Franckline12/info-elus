import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { computeQuizStats } from '@/lib/queries/quizStats'
import {
  getCurrentQuiz,
  getPastQuizzes,
  getPlayableQuizBySlug,
  getQuizBySlug,
  getQuizzes,
} from '@/lib/queries/quizzes'
import type { Quiz, Theme } from '@/payload-types'

/**
 * Trois exigences ne se vérifient qu'en traversant Payload :
 * — la règle « exactement une bonne réponse » doit bloquer l'API, pas seulement
 *   l'admin, et nommer la question fautive ;
 * — aucun brouillon ni aucun quiz daté du futur ne doit sortir de la couche de
 *   lecture (la Local API ignore les droits d'accès par défaut) ;
 * — le compteur communautaire doit s'agréger en base, y compris sans partie.
 */
describe('Quiz : validation, lectures publiques et compteur', () => {
  let payload: Payload
  let theme: Theme
  const createdIds: number[] = []

  const SUFFIX = 'int-test-quizzes'

  const OPTIONS = [
    { text: 'Bonne réponse', isCorrect: true },
    { text: 'Mauvaise réponse', isCorrect: false },
  ]

  const createQuiz = async (data: {
    title: string
    slug: string
    status: 'draft' | 'published'
    week: string
    questions?: Quiz['questions']
  }) => {
    const doc = await payload.create({
      collection: 'quizzes',
      draft: data.status === 'draft',
      context: { disableRevalidate: true },
      data: {
        title: data.title,
        slug: data.slug,
        intro: 'Introduction de test.',
        theme: theme.id,
        week: data.week,
        questions: data.questions ?? [
          { prompt: 'Énoncé de test', options: OPTIONS, explanation: 'Explication de test.' },
        ],
        _status: data.status,
        publishedAt: '2026-01-01T00:00:00.000Z',
      },
    })
    createdIds.push(doc.id)
    return doc
  }

  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    theme = await payload.create({
      collection: 'themes',
      data: { name: `Thème ${SUFFIX}`, slug: `theme-${SUFFIX}`, color: 'blue-mid' },
    })

    await createQuiz({
      title: 'Quiz de la semaine',
      slug: `courant-${SUFFIX}`,
      status: 'published',
      week: '2026-09-21T00:00:00.000Z',
    })

    await createQuiz({
      title: 'Quiz précédent',
      slug: `precedent-${SUFFIX}`,
      status: 'published',
      week: '2026-09-14T00:00:00.000Z',
    })

    await createQuiz({
      title: 'Quiz brouillon',
      slug: `brouillon-${SUFFIX}`,
      status: 'draft',
      week: '2026-09-21T00:00:00.000Z',
    })

    await createQuiz({
      title: 'Quiz à venir',
      slug: `a-venir-${SUFFIX}`,
      status: 'published',
      week: '2099-01-05T00:00:00.000Z',
    })
  })

  afterAll(async () => {
    if (createdIds.length > 0) {
      await payload.delete({
        collection: 'quiz-results',
        where: { quiz: { in: createdIds } },
      })
      await payload.delete({
        collection: 'quizzes',
        where: { id: { in: createdIds } },
        context: { disableRevalidate: true },
      })
    }
    await payload.delete({ collection: 'themes', where: { id: { equals: theme.id } } })
  })

  const publish = (questions: Quiz['questions']) =>
    createQuiz({
      title: 'Quiz invalide',
      slug: `invalide-${SUFFIX}-${questions.length}-${Math.round(Math.random() * 1e6)}`,
      status: 'published',
      week: '2026-09-21T00:00:00.000Z',
      questions,
    })

  /**
   * Payload résume la faute dans `message` (« Le champ suivant n'est pas
   * valide ») et place le détail dans `data.errors` : c'est ce détail que
   * l'admin affiche sous le champ et que l'API REST renvoie au client. C'est
   * donc là que le numéro de la question doit se trouver.
   */
  const expectRefusal = async (attempt: Promise<unknown>, expected: RegExp) => {
    try {
      await attempt
    } catch (error) {
      const { errors } = (error as { data?: { errors?: { message?: string }[] } }).data ?? {}
      const messages = (errors ?? []).map((item) => item.message ?? '').join(' ')

      expect(messages).toMatch(expected)
      return
    }

    throw new Error('La publication aurait dû être refusée.')
  }

  describe('validation des questions', () => {
    it('refuse la publication d’une question sans bonne réponse', async () => {
      await expectRefusal(
        publish([{ prompt: 'Énoncé', options: [{ text: 'A' }, { text: 'B' }] }]),
        /Question 1 : cochez la réponse correcte/,
      )
    })

    it('refuse la publication d’une question à deux bonnes réponses', async () => {
      await expectRefusal(
        publish([
          {
            prompt: 'Énoncé',
            options: [
              { text: 'A', isCorrect: true },
              { text: 'B', isCorrect: true },
            ],
          },
        ]),
        /Question 1 : une seule réponse peut être correcte \(2 sont cochées\)/,
      )
    })

    it('refuse la publication d’une question à une seule option', async () => {
      await expect(
        publish([{ prompt: 'Énoncé', options: [{ text: 'A', isCorrect: true }] }]),
      ).rejects.toThrow()
    })

    it('nomme la question fautive au milieu d’un quiz valide', async () => {
      await expectRefusal(
        publish([
          { prompt: 'Première', options: OPTIONS },
          { prompt: 'Deuxième', options: [{ text: 'A' }, { text: 'B' }] },
        ]),
        /Question 2 :/,
      )
    })

    it('accepte un quiz dont chaque question a exactement une bonne réponse', async () => {
      const quiz = await publish([
        { prompt: 'Première', options: OPTIONS },
        {
          prompt: 'Deuxième',
          options: [{ text: 'A' }, { text: 'B', isCorrect: true }, { text: 'C' }],
        },
      ])

      expect(quiz._status).toBe('published')
    })

    it('laisse enregistrer un brouillon incomplet : la validation ne bloque que la publication', async () => {
      const draft = await createQuiz({
        title: 'Quiz en cours de rédaction',
        slug: `brouillon-incomplet-${SUFFIX}`,
        status: 'draft',
        week: '2026-09-21T00:00:00.000Z',
        questions: [{ prompt: 'Énoncé', options: [{ text: 'A' }, { text: 'B' }] }],
      })

      expect(draft._status).toBe('draft')
    })
  })

  describe('lectures publiques', () => {
    it('n’expose ni brouillon ni quiz à venir', async () => {
      const { docs } = await getQuizzes({ limit: 50 })
      const slugs = docs.map((doc) => doc.slug)

      expect(slugs).toContain(`courant-${SUFFIX}`)
      expect(slugs).not.toContain(`brouillon-${SUFFIX}`)
      expect(slugs).not.toContain(`a-venir-${SUFFIX}`)
    })

    it('renvoie null pour le slug d’un brouillon', async () => {
      await expect(getQuizBySlug(`brouillon-${SUFFIX}`)).resolves.toBeNull()
      await expect(getPlayableQuizBySlug(`brouillon-${SUFFIX}`)).resolves.toBeNull()
    })

    it('classe les quiz de la semaine la plus récente à la plus ancienne', async () => {
      const { docs } = await getQuizzes({ limit: 50 })
      const weeks = docs.map((doc) => doc.week ?? '')

      expect([...weeks]).toEqual([...weeks].sort().reverse())
    })

    it('met en avant un quiz dont la semaine est arrivée, et le retire de l’historique', async () => {
      const current = await getCurrentQuiz()
      const past = await getPastQuizzes({ limit: 50, exceptId: current?.id ?? null })

      expect(current?.week && new Date(current.week) <= new Date()).toBe(true)
      expect(past.docs.map((quiz) => quiz.slug)).not.toContain(current?.slug)
    })

    it('pagine l’historique sans répéter ni sauter de quiz', async () => {
      const current = await getCurrentQuiz()
      const exceptId = current?.id ?? null

      const all = await getPastQuizzes({ limit: 100, exceptId })
      expect(all.totalDocs).toBeGreaterThan(1)

      // Une page d'un seul quiz : la page 2 doit reprendre exactement là où la
      // page 1 s'arrête, faute de quoi l'exclusion du quiz mis en avant aurait
      // décalé la fenêtre.
      const first = await getPastQuizzes({ page: 1, limit: 1, exceptId })
      const second = await getPastQuizzes({ page: 2, limit: 1, exceptId })

      expect(first.docs.map((quiz) => quiz.slug)).toEqual([all.docs[0]?.slug])
      expect(second.docs.map((quiz) => quiz.slug)).toEqual([all.docs[1]?.slug])
      expect(first.totalPages).toBe(all.totalDocs)
      expect(first.hasNextPage).toBe(true)
      expect(second.hasPrevPage).toBe(true)
    })

    it('au-delà de la dernière page, l’historique est vide plutôt qu’en erreur', async () => {
      const current = await getCurrentQuiz()
      const history = await getPastQuizzes({
        page: 9999,
        limit: 12,
        exceptId: current?.id ?? null,
      })

      expect(history.docs).toEqual([])
      expect(history.hasNextPage).toBe(false)
    })

    it('n’envoie au navigateur ni bonne réponse ni explication', async () => {
      const playable = await getPlayableQuizBySlug(`courant-${SUFFIX}`)

      expect(playable).not.toBeNull()
      expect(JSON.stringify(playable)).not.toContain('isCorrect')
      expect(JSON.stringify(playable)).not.toContain('Explication de test.')
      expect(playable?.questions[0]?.options).toEqual([
        { text: 'Bonne réponse' },
        { text: 'Mauvaise réponse' },
      ])
    })

    it('le document complet, lui, garde la correction : il reste côté serveur', async () => {
      const quiz = await getQuizBySlug(`courant-${SUFFIX}`)

      expect(quiz?.questions[0]?.options[0]?.isCorrect).toBe(true)
    })
  })

  describe('compteur communautaire', () => {
    it('ne divise pas par zéro quand aucune partie n’a été jouée', async () => {
      const quiz = await getQuizBySlug(`precedent-${SUFFIX}`)
      const stats = await computeQuizStats(quiz?.id)

      expect(stats).toMatchObject({ plays: 0, score: 0, total: 0, successRate: 0 })
    })

    it('agrège parties jouées et taux de bonnes réponses', async () => {
      const quiz = await getQuizBySlug(`courant-${SUFFIX}`)
      if (!quiz) throw new Error('Quiz de test introuvable')

      for (const score of [4, 2, 3]) {
        await payload.create({
          collection: 'quiz-results',
          data: { quiz: quiz.id, score, total: 5, playedAt: new Date().toISOString() },
        })
      }

      const stats = await computeQuizStats(quiz.id)

      expect(stats.plays).toBe(3)
      expect(stats.score).toBe(9)
      expect(stats.total).toBe(15)
      expect(stats.successRate).toBe(60)
    })

    it('refuse un résultat incohérent, même par l’API : le score ne vient jamais du client', async () => {
      const quiz = await getQuizBySlug(`courant-${SUFFIX}`)
      if (!quiz) throw new Error('Quiz de test introuvable')

      await expect(
        payload.create({
          collection: 'quiz-results',
          data: { quiz: quiz.id, score: 99, total: 5 },
        }),
      ).rejects.toThrow()

      await expect(
        payload.create({
          collection: 'quiz-results',
          data: { quiz: quiz.id, score: 1, total: 0 },
        }),
      ).rejects.toThrow()
    })
  })
})
