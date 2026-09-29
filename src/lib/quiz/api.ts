/**
 * Petits utilitaires communs aux deux routes de quiz : lecture du corps JSON,
 * réponses d'erreur normalisées. Les messages sont en français, ils peuvent
 * être affichés tels quels par le parcours de jeu.
 */

import type { RateLimitVerdict } from './rateLimit'

export type QuizReference = {
  quizId?: number | string | null
  slug?: string | null
}

export const jsonError = (status: number, message: string, init?: ResponseInit): Response =>
  Response.json({ error: message }, { ...init, status })

export const tooManyRequests = (verdict: RateLimitVerdict): Response =>
  jsonError(429, 'Trop de tentatives. Patientez quelques instants avant de réessayer.', {
    headers: { 'Retry-After': String(verdict.retryAfter) },
  })

/** Corps JSON de la requête, ou `null` s'il est absent ou mal formé. */
export const readJsonBody = async (request: Request): Promise<Record<string, unknown> | null> => {
  try {
    const body: unknown = await request.json()
    return body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

/** Référence du quiz acceptée par les deux routes : identifiant ou slug. */
export const readQuizReference = (body: Record<string, unknown>): QuizReference => ({
  quizId:
    typeof body.quizId === 'number' || typeof body.quizId === 'string' ? body.quizId : undefined,
  slug: typeof body.slug === 'string' ? body.slug : undefined,
})
