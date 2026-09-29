import { describe, expect, it } from 'vitest'

import {
  correctIndexOf,
  findQuestionIssues,
  pointsOf,
  validateQuestions,
} from '@/lib/quiz/questions'

/**
 * Règle critique du § 2.5 : une question à zéro ou plusieurs bonnes réponses
 * casserait le parcours de jeu. Elle est vérifiée ici sur la fonction pure, et
 * dans `tests/int/quizzes.int.spec.ts` sur la collection Payload.
 */
const question = (
  options: { text: string; isCorrect?: boolean }[],
  extra: Record<string, unknown> = {},
) => ({ prompt: 'Énoncé de test', options, ...extra })

const VALID = question([
  { text: 'Bonne réponse', isCorrect: true },
  { text: 'Mauvaise réponse' },
])

describe('findQuestionIssues', () => {
  it('accepte une question à deux options dont une seule est correcte', () => {
    expect(findQuestionIssues([VALID])).toEqual([])
    expect(validateQuestions([VALID])).toBe(true)
  })

  it('refuse une question sans bonne réponse, en la nommant', () => {
    const issues = findQuestionIssues([
      VALID,
      question([{ text: 'Réponse A' }, { text: 'Réponse B' }]),
    ])

    expect(issues).toHaveLength(1)
    expect(issues[0]).toContain('Question 2')
    expect(issues[0]).toContain('cochez la réponse correcte')
  })

  it('refuse une question à deux bonnes réponses, en la nommant', () => {
    const issues = findQuestionIssues([
      question([
        { text: 'Réponse A', isCorrect: true },
        { text: 'Réponse B', isCorrect: true },
        { text: 'Réponse C' },
      ]),
    ])

    expect(issues).toHaveLength(1)
    expect(issues[0]).toContain('Question 1')
    expect(issues[0]).toContain('2 sont cochées')
  })

  it('refuse une question qui ne propose qu’une seule option', () => {
    const issues = findQuestionIssues([question([{ text: 'Seule réponse', isCorrect: true }])])

    expect(issues).toHaveLength(1)
    expect(issues[0]).toContain('Question 1')
    expect(issues[0]).toContain('au moins 2 réponses')
  })

  it('signale chaque question fautive d’un quiz qui en compte plusieurs', () => {
    const issues = findQuestionIssues([
      VALID,
      question([{ text: 'Réponse A' }, { text: 'Réponse B' }]),
      VALID,
      question([
        { text: 'Réponse A', isCorrect: true },
        { text: 'Réponse B', isCorrect: true },
      ]),
    ])

    expect(issues).toHaveLength(2)
    expect(issues[0]).toContain('Question 2')
    expect(issues[1]).toContain('Question 4')
  })

  it('renvoie un message unique, en français, au format attendu par Payload', () => {
    const result = validateQuestions([question([{ text: 'Réponse A' }, { text: 'Réponse B' }])])

    expect(typeof result).toBe('string')
    expect(result).toMatch(/^Question 1 : /)
  })

  it('laisse passer une valeur non tabulaire : la validation d’array s’en charge', () => {
    expect(validateQuestions(undefined)).toBe(true)
    expect(validateQuestions(3)).toBe(true)
  })
})

describe('correctIndexOf et pointsOf', () => {
  it('renvoie l’index de l’unique bonne réponse', () => {
    expect(correctIndexOf(VALID)).toBe(0)
    expect(
      correctIndexOf(question([{ text: 'A' }, { text: 'B', isCorrect: true }, { text: 'C' }])),
    ).toBe(1)
  })

  it('renvoie -1 quand la question est mal formée', () => {
    expect(correctIndexOf(question([{ text: 'A' }, { text: 'B' }]))).toBe(-1)
    expect(
      correctIndexOf(question([{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: true }])),
    ).toBe(-1)
    expect(correctIndexOf(null)).toBe(-1)
  })

  it('vaut 1 point par défaut, et refuse les barèmes aberrants', () => {
    expect(pointsOf(VALID)).toBe(1)
    expect(pointsOf(question([], { points: 3 }))).toBe(3)
    expect(pointsOf(question([], { points: -2 }))).toBe(1)
    expect(pointsOf(question([], { points: null }))).toBe(1)
  })
})
