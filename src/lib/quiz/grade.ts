/**
 * Correction d'un quiz, côté serveur uniquement.
 *
 * Le client n'envoie que les index choisis : le score est systématiquement
 * recalculé à partir des bonnes réponses en base. Un score transmis par le
 * navigateur n'est jamais lu (§ 2.5 — le compteur communautaire doit rester
 * crédible).
 */

import { correctIndexOf, pointsOf, type QuizQuestionInput } from './questions'

export const CSE_NAME_MAX_LENGTH = 80

export type GradedAnswer = {
  /** Index de la question dans le quiz. */
  question: number
  /** Index choisi par le joueur. */
  answer: number
  correctIndex: number
  isCorrect: boolean
  points: number
  explanation: string | null
}

export type Grade = {
  /** Points obtenus. */
  score: number
  /** Points maximum du quiz. */
  total: number
  correctCount: number
  questionCount: number
  answers: GradedAnswer[]
}

/**
 * Vérifie que le tableau de réponses correspond au quiz : une réponse par
 * question, chaque index désignant une option existante. Renvoie le message
 * d'erreur à retourner au client, ou `null` si la soumission est recevable.
 */
export const findAnswersIssue = (
  questions: QuizQuestionInput[],
  answers: unknown,
): string | null => {
  if (!Array.isArray(answers)) {
    return 'Le corps de la requête doit contenir un tableau « answers ».'
  }

  if (answers.length !== questions.length) {
    return `Ce quiz compte ${questions.length} question${questions.length > 1 ? 's' : ''}, ${answers.length} réponse${answers.length > 1 ? 's' : ''} ont été envoyées.`
  }

  for (let index = 0; index < answers.length; index += 1) {
    const answer: unknown = answers[index]
    const optionCount = questions[index]?.options?.length ?? 0

    if (!Number.isInteger(answer) || (answer as number) < 0 || (answer as number) >= optionCount) {
      return `Réponse invalide pour la question ${index + 1}.`
    }
  }

  return null
}

/** Corrige une soumission déjà validée par `findAnswersIssue`. */
export const gradeQuiz = (questions: QuizQuestionInput[], answers: number[]): Grade => {
  const graded = questions.map<GradedAnswer>((question, index) => {
    const correctIndex = correctIndexOf(question)
    const answer = answers[index] as number
    const points = pointsOf(question)

    return {
      question: index,
      answer,
      correctIndex,
      isCorrect: correctIndex >= 0 && answer === correctIndex,
      points,
      explanation: question?.explanation?.trim() || null,
    }
  })

  return {
    score: graded.reduce((sum, answer) => sum + (answer.isCorrect ? answer.points : 0), 0),
    total: graded.reduce((sum, answer) => sum + answer.points, 0),
    correctCount: graded.filter((answer) => answer.isCorrect).length,
    questionCount: graded.length,
    answers: graded,
  }
}

/** Caractères de contrôle et chevrons, remplacés par une espace. */
const UNSAFE_CHARACTERS = /[\u0000-\u001F\u007F<>]/g

/**
 * Nettoie le nom de CSE : saisie libre et facultative, affichée telle quelle
 * dans les statistiques. On retire les caractères de contrôle et les chevrons,
 * on écrase les espaces multiples, puis on tronque.
 *
 * Renvoie `null` quand il ne reste rien à conserver : la collection ne stocke
 * pas de chaîne vide.
 */
export const sanitizeCseName = (value: unknown): string | null => {
  if (typeof value !== 'string') return null

  const cleaned = value
    .replace(UNSAFE_CHARACTERS, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, CSE_NAME_MAX_LENGTH)
    .trim()

  return cleaned.length > 0 ? cleaned : null
}
