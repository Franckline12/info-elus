import { jsonError, readJsonBody, tooManyRequests } from '@/lib/api'
import { readQuizReference } from '@/lib/quiz/api'
import { correctIndexOf, pointsOf } from '@/lib/quiz/questions'
import { clientKey, createRateLimiter } from '@/lib/rateLimit'
import { findPublishedQuiz } from '@/lib/queries/quizzes'

/**
 * Correction d'une question, à la demande.
 *
 * La page de jeu ne reçoit que les énoncés et les intitulés d'options : la
 * bonne réponse et l'explication n'existent nulle part dans le HTML. C'est
 * cette route qui les livre, une question à la fois, après que le joueur a
 * choisi — soit la première des deux approches ouvertes par le cahier des
 * charges (§ 2.5, retour immédiat).
 *
 * Elle ne révèle donc jamais plus que la question à laquelle on vient de
 * répondre, et n'enregistre rien : seul `/api/quiz/result` écrit en base.
 */

export const dynamic = 'force-dynamic'

/** Un quiz fait cinq questions : trente corrections par minute laissent de la marge. */
const limiter = createRateLimiter({ limit: 30, windowMs: 60_000 })

export async function POST(request: Request): Promise<Response> {
  const verdict = limiter(clientKey(request))
  if (!verdict.allowed) return tooManyRequests(verdict)

  const body = await readJsonBody(request)
  if (!body) return jsonError(400, 'Corps de requête JSON attendu.')

  const { quizId, slug } = readQuizReference(body)
  const questionIndex = body.question
  const answer = body.answer

  if (!Number.isInteger(questionIndex) || (questionIndex as number) < 0) {
    return jsonError(400, 'Index de question invalide.')
  }

  const quiz = await findPublishedQuiz({ id: quizId, slug })
  if (!quiz) return jsonError(404, 'Quiz introuvable ou non publié.')

  const question = quiz.questions?.[questionIndex as number]
  if (!question) return jsonError(400, 'Cette question n’existe pas dans ce quiz.')

  const optionCount = question.options?.length ?? 0
  if (!Number.isInteger(answer) || (answer as number) < 0 || (answer as number) >= optionCount) {
    return jsonError(400, 'Réponse invalide pour cette question.')
  }

  const correctIndex = correctIndexOf(question)

  // Un quiz publié passe forcément la validation de la collection ; si un
  // document ancien échappait à la règle, mieux vaut une erreur franche qu'une
  // correction fantaisiste.
  if (correctIndex < 0) {
    return jsonError(500, 'Cette question n’a pas de réponse correcte exploitable.')
  }

  return Response.json({
    question: questionIndex,
    answer,
    correctIndex,
    isCorrect: answer === correctIndex,
    points: pointsOf(question),
    explanation: question.explanation?.trim() || null,
  })
}
