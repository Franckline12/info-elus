import { jsonError, readJsonBody, tooManyRequests } from '@/lib/api'
import { readQuizReference } from '@/lib/quiz/api'
import { findAnswersIssue, gradeQuiz, sanitizeCseName } from '@/lib/quiz/grade'
import { clientKey, createRateLimiter } from '@/lib/rateLimit'
import { findPublishedQuiz } from '@/lib/queries/quizzes'
import { getPayloadClient } from '@/lib/queries/payload'
import { isValidEmail } from '@/lib/newsletter/email'
import { buildQuizResultEmail } from '@/emails/quizResult'
import { absoluteUrl } from '@/lib/site'
import { quizzesPath } from '@/lib/routes'

export const dynamic = 'force-dynamic'

/** Limiteur de débit : 5 envois par 15 minutes par IP pour éviter le spam d'emails. */
const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60_000 })

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

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (!isValidEmail(email)) {
    return jsonError(400, 'Adresse email invalide.')
  }

  const nom = typeof body.nom === 'string' ? body.nom.trim() : ''
  const prenom = typeof body.prenom === 'string' ? body.prenom.trim() : ''
  const entrepriseCse =
    typeof body.entrepriseCse === 'string' ? body.entrepriseCse.trim() : ''

  if (!nom || !prenom) {
    return jsonError(400, 'Le nom et le prénom sont requis.')
  }

  const grade = gradeQuiz(questions, body.answers as number[])
  const cseName = sanitizeCseName(entrepriseCse)
  const fullName = `${prenom} ${nom}`.trim()
  const resultId = typeof body.resultId === 'number' ? body.resultId : undefined

  const payload = await getPayloadClient()

  // Enregistrement des coordonnées dans le back-office (collection quiz-results)
  try {
    let updated = false
    if (resultId) {
      try {
        await payload.update({
          collection: 'quiz-results',
          id: resultId,
          data: {
            nom,
            prenom,
            email,
            ...(cseName ? { cseName } : {}),
          },
          depth: 0,
          overrideAccess: true,
        })
        updated = true
      } catch (err) {
        payload.logger.warn({ err }, 'Mise à jour du résultat existant impossible, création d’une entrée')
        updated = false
      }
    }

    if (!updated) {
      await payload.create({
        collection: 'quiz-results',
        data: {
          quiz: quiz.id,
          score: grade.score,
          total: grade.total,
          nom,
          prenom,
          email,
          ...(cseName ? { cseName } : {}),
          playedAt: new Date().toISOString(),
        },
        depth: 0,
        overrideAccess: true,
      })
    }
  } catch (error) {
    payload.logger.error(
      { err: error },
      'Enregistrement des coordonnées du participant au quiz impossible',
    )
  }

  const quizUrl = quiz.slug ? absoluteUrl(`${quizzesPath}/${quiz.slug}`) : undefined

  const { subject, html, text } = buildQuizResultEmail({
    recipientName: fullName,
    quizTitle: quiz.title,
    score: grade.score,
    total: grade.total,
    correctCount: grade.correctCount,
    questionCount: grade.questionCount,
    companyCse: cseName || null,
    quizUrl,
  })

  try {
    await payload.sendEmail({
      to: email,
      subject,
      html,
      text,
    })
  } catch (error) {
    payload.logger.error({ err: error }, 'Échec de l’envoi de l’email des résultats de quiz')
    return jsonError(500, 'L’envoi de l’email a échoué. Veuillez réessayer ultérieurement.')
  }

  return Response.json({
    success: true,
    message: 'Vos résultats ont bien été envoyés par email.',
  })
}
