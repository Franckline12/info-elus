/**
 * Projection « jouable » d'un quiz : ce qui part réellement dans le navigateur.
 *
 * Le document Payload porte `isCorrect` sur chaque option et l'explication de
 * chaque question. Ces deux informations ne doivent jamais être sérialisées
 * dans le HTML de la page de jeu, sinon les réponses se lisent dans le code
 * source. La correction est demandée question par question à l'API.
 */

import type { Quiz, Theme } from '@/payload-types'

import { pointsOf } from './questions'

export type PlayableOption = {
  text: string
}

export type PlayableQuestion = {
  prompt: string
  points: number
  options: PlayableOption[]
}

export type PlayableQuiz = {
  id: number
  slug: string
  title: string
  intro: string | null
  week: string | null
  themeName: string | null
  questions: PlayableQuestion[]
  /** Points maximum : le barème peut être affiché sans rien révéler. */
  totalPoints: number
}

/** Retire des questions tout ce qui révèle la correction. */
export const toPlayableQuiz = (quiz: Quiz): PlayableQuiz => {
  const questions = (quiz.questions ?? []).map<PlayableQuestion>((question) => ({
    prompt: question.prompt,
    points: pointsOf(question),
    options: (question.options ?? []).map((option) => ({ text: option.text })),
  }))

  const theme = quiz.theme as Theme | number | null | undefined

  return {
    id: quiz.id,
    slug: quiz.slug ?? '',
    title: quiz.title,
    intro: quiz.intro ?? null,
    week: quiz.week ?? null,
    themeName: theme && typeof theme === 'object' ? theme.name : null,
    questions,
    totalPoints: questions.reduce((sum, question) => sum + question.points, 0),
  }
}

/**
 * Vignette de listing : ni options, ni explications, seulement de quoi
 * présenter le quiz et annoncer sa longueur.
 */
export type QuizSummary = {
  id: number
  slug: string
  title: string
  intro: string | null
  week: string | null
  publishedAt: string | null
  theme: Theme | null
  questionCount: number
  totalPoints: number
}

export const toQuizSummary = (quiz: Quiz): QuizSummary => {
  const questions = quiz.questions ?? []
  const theme = quiz.theme as Theme | number | null | undefined

  return {
    id: quiz.id,
    slug: quiz.slug ?? '',
    title: quiz.title,
    intro: quiz.intro ?? null,
    week: quiz.week ?? null,
    publishedAt: quiz.publishedAt ?? null,
    theme: theme && typeof theme === 'object' ? theme : null,
    questionCount: questions.length,
    totalPoints: questions.reduce((sum, question) => sum + pointsOf(question), 0),
  }
}
