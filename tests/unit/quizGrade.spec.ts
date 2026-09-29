import { describe, expect, it } from 'vitest'

import { findAnswersIssue, gradeQuiz, sanitizeCseName } from '@/lib/quiz/grade'
import { toPlayableQuiz } from '@/lib/quiz/playable'
import type { QuizQuestionInput } from '@/lib/quiz/questions'
import { createRateLimiter } from '@/lib/quiz/rateLimit'
import type { Quiz } from '@/payload-types'

/**
 * Le score est recalculé par le serveur : ces tests fixent le comportement de
 * la correction, seul juge du compteur communautaire (§ 2.5).
 */

const QUESTIONS: QuizQuestionInput[] = [
  {
    prompt: 'Question 1',
    options: [{ text: 'A', isCorrect: true }, { text: 'B' }],
    explanation: 'Parce que A.',
  },
  {
    prompt: 'Question 2',
    options: [{ text: 'A' }, { text: 'B' }, { text: 'C', isCorrect: true }],
    explanation: '   ',
  },
  {
    prompt: 'Question 3',
    options: [{ text: 'A' }, { text: 'B', isCorrect: true }],
    points: 3,
  },
]

describe('findAnswersIssue', () => {
  it('accepte une réponse par question, dans les bornes', () => {
    expect(findAnswersIssue(QUESTIONS, [0, 2, 1])).toBeNull()
  })

  it('refuse un tableau de la mauvaise longueur', () => {
    expect(findAnswersIssue(QUESTIONS, [0, 1])).toContain('3 questions')
  })

  it('refuse autre chose qu’un tableau', () => {
    expect(findAnswersIssue(QUESTIONS, undefined)).toContain('answers')
    expect(findAnswersIssue(QUESTIONS, { 0: 1 })).toContain('answers')
  })

  it('refuse un index hors des options proposées, en nommant la question', () => {
    expect(findAnswersIssue(QUESTIONS, [0, 3, 1])).toBe('Réponse invalide pour la question 2.')
    expect(findAnswersIssue(QUESTIONS, [-1, 0, 1])).toBe('Réponse invalide pour la question 1.')
  })

  it('refuse un index non entier', () => {
    expect(findAnswersIssue(QUESTIONS, [0, 1.5, 1])).toBe('Réponse invalide pour la question 2.')
    expect(findAnswersIssue(QUESTIONS, [0, '1', 1])).toBe('Réponse invalide pour la question 2.')
    expect(findAnswersIssue(QUESTIONS, [0, null, 1])).toBe('Réponse invalide pour la question 2.')
  })
})

describe('gradeQuiz', () => {
  it('compte les points de chaque bonne réponse, jamais ceux du client', () => {
    const grade = gradeQuiz(QUESTIONS, [0, 2, 1])

    expect(grade.score).toBe(5)
    expect(grade.total).toBe(5)
    expect(grade.correctCount).toBe(3)
    expect(grade.questionCount).toBe(3)
  })

  it('n’attribue rien à une mauvaise réponse mais conserve le barème', () => {
    const grade = gradeQuiz(QUESTIONS, [1, 0, 0])

    expect(grade.score).toBe(0)
    expect(grade.total).toBe(5)
    expect(grade.correctCount).toBe(0)
  })

  it('pondère par les points de la question', () => {
    expect(gradeQuiz(QUESTIONS, [1, 0, 1]).score).toBe(3)
    expect(gradeQuiz(QUESTIONS, [0, 2, 0]).score).toBe(2)
  })

  it('détaille bonnes et mauvaises réponses, avec l’explication rédigée', () => {
    const { answers } = gradeQuiz(QUESTIONS, [0, 0, 1])

    expect(answers[0]).toMatchObject({ isCorrect: true, correctIndex: 0, explanation: 'Parce que A.' })
    expect(answers[1]).toMatchObject({ isCorrect: false, correctIndex: 2, answer: 0 })
    // Une explication vide n'est pas envoyée au client.
    expect(answers[1]?.explanation).toBeNull()
    expect(answers[2]).toMatchObject({ isCorrect: true, points: 3 })
  })

  it('ne valide jamais une question sans bonne réponse exploitable', () => {
    const broken: QuizQuestionInput[] = [{ prompt: 'Cassée', options: [{ text: 'A' }, { text: 'B' }] }]
    const grade = gradeQuiz(broken, [0])

    expect(grade.answers[0]?.correctIndex).toBe(-1)
    expect(grade.answers[0]?.isCorrect).toBe(false)
    expect(grade.score).toBe(0)
  })
})

describe('sanitizeCseName', () => {
  it('conserve une saisie normale', () => {
    expect(sanitizeCseName('  CSE Groupe Lumen ')).toBe('CSE Groupe Lumen')
  })

  it('écrase les espaces multiples et les retours à la ligne', () => {
    expect(sanitizeCseName('CSE\n\tAtelier   Nord')).toBe('CSE Atelier Nord')
  })

  it('neutralise les chevrons', () => {
    expect(sanitizeCseName('<script>alert(1)</script>')).toBe('script alert(1) /script')
  })

  it('tronque à 80 caractères', () => {
    expect(sanitizeCseName('a'.repeat(200))).toHaveLength(80)
  })

  it('renvoie null pour une saisie vide ou absente : le champ est facultatif', () => {
    expect(sanitizeCseName('   ')).toBeNull()
    expect(sanitizeCseName(undefined)).toBeNull()
    expect(sanitizeCseName(42)).toBeNull()
  })
})

describe('createRateLimiter', () => {
  it('laisse passer les premiers appels puis bloque, avec un délai d’attente', () => {
    const limit = createRateLimiter({ limit: 2, windowMs: 60_000 })

    expect(limit('ip', 0).allowed).toBe(true)
    expect(limit('ip', 1_000).allowed).toBe(true)

    const blocked = limit('ip', 2_000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfter).toBeGreaterThan(0)
  })

  it('compte séparément chaque clé', () => {
    const limit = createRateLimiter({ limit: 1, windowMs: 60_000 })

    expect(limit('a', 0).allowed).toBe(true)
    expect(limit('b', 0).allowed).toBe(true)
    expect(limit('a', 0).allowed).toBe(false)
  })

  it('rouvre la fenêtre une fois le délai écoulé', () => {
    const limit = createRateLimiter({ limit: 1, windowMs: 60_000 })

    expect(limit('ip', 0).allowed).toBe(true)
    expect(limit('ip', 30_000).allowed).toBe(false)
    expect(limit('ip', 60_001).allowed).toBe(true)
  })
})

describe('toPlayableQuiz', () => {
  it('n’expose ni les bonnes réponses ni les explications', () => {
    const quiz = {
      id: 1,
      title: 'Quiz de test',
      intro: 'Introduction',
      slug: 'quiz-de-test',
      week: '2026-09-21T00:00:00.000Z',
      theme: { id: 2, name: 'Élections', slug: 'elections', color: 'blue-bright' },
      questions: [
        {
          prompt: 'Question 1',
          explanation: 'La réponse est A.',
          points: 2,
          options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
          ],
        },
      ],
      updatedAt: '',
      createdAt: '',
    } as unknown as Quiz

    const playable = toPlayableQuiz(quiz)
    const serialized = JSON.stringify(playable)

    expect(serialized).not.toContain('isCorrect')
    expect(serialized).not.toContain('La réponse est A.')
    expect(playable.questions[0]?.options).toEqual([{ text: 'A' }, { text: 'B' }])
    expect(playable.totalPoints).toBe(2)
    expect(playable.themeName).toBe('Élections')
  })
})
