import { jsonError, readJsonBody, tooManyRequests } from '@/lib/api'
import { readQuizReference } from '@/lib/quiz/api'
import { findAnswersIssue, gradeQuiz, sanitizeCseName } from '@/lib/quiz/grade'
import { clientKey, createRateLimiter } from '@/lib/rateLimit'
import { findPublishedQuiz } from '@/lib/queries/quizzes'
import { getPayloadClient } from '@/lib/queries/payload'

/**
 * Enregistrement d'une partie (§ 2.5).
 *
 * L'écriture ne passe pas par l'API REST de Payload : cette route est le seul
 * chemin prévu, et elle recalcule systématiquement le score à partir des
 * bonnes réponses en base. Un score envoyé par le client est ignoré — sans
 * quoi le compteur communautaire ne voudrait plus rien dire.
 *
 * RGPD (§ 4.4) : rien d'autre que le quiz, le score, le barème, un nom de CSE
 * facultatif et l'horodatage n'est écrit. L'adresse IP sert uniquement de clé
 * de comptage en mémoire pour la limitation de débit.
 */

export const dynamic = 'force-dynamic'

/** Quelques envois par minute : de quoi rejouer, pas de quoi gonfler le compteur. */
const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 })

export async function POST(request: Request): Promise<Response> {
  const verdict = limiter(clientKey(request))
  if (!verdict.allowed) return tooManyRequests(verdict)

  const body = await readJsonBody(request)
  if (!body) return jsonError(400, 'Corps de requête JSON attendu.')

  const { quizId, slug } = readQuizReference(body)

  const quiz = await findPublishedQuiz({ id: quizId, slug })
  if (!quiz) return jsonError(404, 'Quiz introuvable ou non publié.')

  const questions = quiz.questions ?? []
  if (questions.length === 0) return jsonError(400, 'Ce quiz ne contient aucune question.')

  const issue = findAnswersIssue(questions, body.answers)
  if (issue) return jsonError(400, issue)

  const grade = gradeQuiz(questions, body.answers as number[])
  const cseName = sanitizeCseName(body.cseName)

  // L'enregistrement est secondaire : le joueur doit voir son score même si
  // l'écriture échoue. Le parcours de jeu affiche alors un avertissement.
  let saved = false
  let resultId: number | null = null

  try {
    const payload = await getPayloadClient()

    const created = await payload.create({
      collection: 'quiz-results',
      data: {
        quiz: quiz.id,
        score: grade.score,
        total: grade.total,
        ...(cseName ? { cseName } : {}),
        playedAt: new Date().toISOString(),
      },
      // Les hooks de revalidation ne concernent pas cette collection, mais le
      // compteur communautaire se rafraîchit de lui-même (cache de 5 minutes).
      depth: 0,
    })

    saved = true
    resultId = created.id
  } catch (error) {
    const payload = await getPayloadClient()
    payload.logger.error({ err: error }, 'Enregistrement d’un résultat de quiz impossible')
  }

  return Response.json({
    resultId,
    quiz: { id: quiz.id, slug: quiz.slug, title: quiz.title },
    score: grade.score,
    total: grade.total,
    correctCount: grade.correctCount,
    questionCount: grade.questionCount,
    answers: grade.answers,
    cseName,
    saved,
  })
}
