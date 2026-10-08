/**
 * Utilitaires communs aux routes d'API du front (quiz, newsletter) : lecture du
 * corps JSON, réponses d'erreur normalisées. Les messages sont en français, ils
 * peuvent être affichés tels quels par les composants clients.
 */

import type { RateLimitVerdict } from './rateLimit'

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
