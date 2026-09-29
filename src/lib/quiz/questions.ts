/**
 * Règles de forme d'une question de quiz (§ 2.5).
 *
 * Isolées ici — sans dépendance à Payload — pour être partagées entre la
 * validation de la collection (admin + API) et le calcul du score, et pour
 * rester testables sans base de données.
 */

export const MIN_OPTIONS = 2

export type QuizOptionInput = {
  text?: string | null
  isCorrect?: boolean | null
} | null

export type QuizQuestionInput = {
  prompt?: string | null
  options?: QuizOptionInput[] | null
  explanation?: string | null
  points?: number | null
} | null

/** Index de l'unique bonne réponse, ou -1 si la question est mal formée. */
export const correctIndexOf = (question: QuizQuestionInput): number => {
  const options = question?.options
  if (!Array.isArray(options)) return -1

  const correct = options.reduce<number[]>(
    (acc, option, index) => (option?.isCorrect ? [...acc, index] : acc),
    [],
  )

  return correct.length === 1 ? correct[0]! : -1
}

/** Points attribués à une question : 1 par défaut, jamais négatifs. */
export const pointsOf = (question: QuizQuestionInput): number => {
  const points = question?.points
  if (typeof points !== 'number' || !Number.isFinite(points) || points < 0) return 1
  return points
}

/**
 * Messages d'erreur (en français, numérotés) des questions mal formées.
 *
 * Une question sans bonne réponse ou avec plusieurs bonnes réponses casserait
 * le parcours de jeu : le serveur ne saurait pas quoi corriger. La liste est
 * vide quand le quiz est jouable.
 */
export const findQuestionIssues = (questions: unknown): string[] => {
  if (!Array.isArray(questions)) return []

  const issues: string[] = []

  questions.forEach((question: QuizQuestionInput, index) => {
    const position = index + 1
    const options = Array.isArray(question?.options) ? question.options : []

    if (options.length < MIN_OPTIONS) {
      issues.push(
        `Question ${position} : proposez au moins ${MIN_OPTIONS} réponses (${options.length} saisie${options.length > 1 ? 's' : ''}).`,
      )
      return
    }

    const correct = options.filter((option) => option?.isCorrect).length

    if (correct === 0) {
      issues.push(`Question ${position} : cochez la réponse correcte.`)
      return
    }

    if (correct > 1) {
      issues.push(
        `Question ${position} : une seule réponse peut être correcte (${correct} sont cochées).`,
      )
    }
  })

  return issues
}

/**
 * `validate` du champ `questions`. Payload l'exécute côté admin comme côté API,
 * et l'ignore sur les enregistrements de brouillon : l'équipe éditoriale peut
 * donc composer un quiz incomplet, mais pas le publier.
 */
export const validateQuestions = (value: unknown): string | true => {
  const issues = findQuestionIssues(value)
  return issues.length === 0 ? true : issues.join(' ')
}
