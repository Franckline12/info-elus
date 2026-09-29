import type { Where } from 'payload'

import {
  toPlayableQuiz,
  toQuizSummary,
  type PlayableQuiz,
  type QuizSummary,
} from '@/lib/quiz/playable'
import type { Quiz } from '@/payload-types'

import { getPayloadClient } from './payload'

/**
 * Lectures publiques de la collection Quiz (§ 2.5).
 *
 * Comme pour les guides, chaque requête filtre explicitement
 * `_status = published` : la Local API ignore les droits d'accès par défaut, un
 * brouillon fuiterait sans ce garde-fou.
 *
 * Deux projections sortent d'ici, et jamais le document brut :
 * — `QuizSummary` pour les listings (aucune option, aucune explication) ;
 * — `PlayableQuiz` pour la page de jeu (les énoncés et les intitulés d'options,
 *   sans `isCorrect` ni explication).
 * La correction est demandée question par question à `/api/quiz/answer`, si
 * bien que la réponse attendue n'est jamais présente dans le HTML.
 */

const PUBLISHED: Where = { _status: { equals: 'published' } }

const DEPTH = 1
/** Le quiz de la semaine prime sur la date de publication technique. */
const SORT_BY_WEEK = '-week'

const publishedWhere = (...clauses: Where[]): Where => ({ and: [PUBLISHED, ...clauses] })

/** Un quiz daté de la semaine prochaine ne doit pas apparaître avant l'heure. */
const released = (now: Date = new Date()): Where => ({
  week: { less_than_equal: now.toISOString() },
})

export type GetQuizzesArgs = {
  page?: number
  limit?: number
}

export type GetPastQuizzesArgs = GetQuizzesArgs & {
  /**
   * Quiz à écarter, typiquement celui déjà mis en avant. L'exclusion doit être
   * demandée sur toutes les pages, pas seulement la première : sans quoi la
   * pagination se décalerait d'un cran à partir de la page 2.
   */
  exceptId?: number | null
}

export type QuizPage = {
  docs: QuizSummary[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

const findQuizPage = async ({
  page,
  limit,
  clauses = [],
}: {
  page: number
  limit: number
  clauses?: Where[]
}): Promise<QuizPage> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'quizzes',
    where: publishedWhere(released(), ...clauses),
    sort: SORT_BY_WEEK,
    depth: DEPTH,
    page,
    limit,
  })

  return {
    docs: result.docs.map(toQuizSummary),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page ?? page,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  }
}

/** Liste paginée, du plus récent au plus ancien (§ 2.5 : historique rejouable). */
export async function getQuizzes({ page = 1, limit = 12 }: GetQuizzesArgs = {}): Promise<QuizPage> {
  return findQuizPage({ page, limit })
}

/** Quiz de la semaine : le plus récent publié dont la semaine est arrivée. */
export async function getCurrentQuiz(): Promise<QuizSummary | null> {
  const { docs } = await getQuizzes({ limit: 1 })
  return docs[0] ?? null
}

/**
 * Historique paginé : les quiz publiés, celui mis en avant excepté. C'est la
 * liste « Les quiz précédents » du listing, et la suggestion de fin de parcours
 * sur la page d'un quiz.
 */
export async function getPastQuizzes({
  page = 1,
  limit = 12,
  exceptId = null,
}: GetPastQuizzesArgs = {}): Promise<QuizPage> {
  return findQuizPage({
    page,
    limit,
    clauses: exceptId == null ? [] : [{ id: { not_equals: exceptId } }],
  })
}

/**
 * Document complet, bonnes réponses comprises : réservé au serveur (correction,
 * enregistrement d'un résultat, métadonnées). Ne jamais le rendre dans une page.
 */
export async function getQuizBySlug(slug: string): Promise<Quiz | null> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'quizzes',
    where: publishedWhere({ slug: { equals: slug } }),
    depth: DEPTH,
    limit: 1,
  })

  return docs[0] ?? null
}

/** Même document, mais expurgé de tout ce qui révèle la correction. */
export async function getPlayableQuizBySlug(slug: string): Promise<PlayableQuiz | null> {
  const quiz = await getQuizBySlug(slug)
  return quiz ? toPlayableQuiz(quiz) : null
}

/** Résolution d'un quiz publié par identifiant ou par slug, pour les routes API. */
export async function findPublishedQuiz({
  id,
  slug,
}: {
  id?: number | string | null
  slug?: string | null
}): Promise<Quiz | null> {
  if (typeof id === 'number' || (typeof id === 'string' && id.trim().length > 0)) {
    const payload = await getPayloadClient()
    const numeric = typeof id === 'number' ? id : Number(id)

    if (!Number.isInteger(numeric)) return null

    const { docs } = await payload.find({
      collection: 'quizzes',
      where: publishedWhere({ id: { equals: numeric } }),
      depth: 0,
      limit: 1,
    })

    return docs[0] ?? null
  }

  if (typeof slug === 'string' && slug.trim().length > 0) {
    return getQuizBySlug(slug.trim())
  }

  return null
}

export async function getPublishedQuizSlugs(): Promise<string[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'quizzes',
    where: publishedWhere(released()),
    depth: 0,
    limit: 1000,
    pagination: false,
    select: { slug: true },
  })

  return docs.map((doc) => doc.slug).filter((slug): slug is string => Boolean(slug))
}
