/**
 * Jetons du double opt-in (§ 4.4).
 *
 * Deux jetons cohabitent sur un abonné : celui de confirmation, à usage unique
 * et daté, et celui de désinscription, durable, qui doit rester valable dans
 * chaque lettre envoyée (le RGPD veut une désinscription aussi simple que
 * l'inscription, donc sans authentification ni expiration).
 */

import { randomBytes, timingSafeEqual } from 'crypto'

/** Validité d'un jeton de confirmation : sept jours, comme annoncé dans l'email. */
export const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

/**
 * 32 octets d'aléa cryptographique (jamais `Math.random`), encodés en base64url
 * pour voyager tels quels dans une URL.
 */
export const createToken = (): string => randomBytes(32).toString('base64url')

/** Fin de validité d'un jeton émis à `now`, au format ISO attendu par Payload. */
export const tokenExpiresAt = (now: Date = new Date()): string =>
  new Date(now.getTime() + TOKEN_TTL_MS).toISOString()

/** Un jeton sans date d'expiration lisible est traité comme expiré. */
export const isTokenExpired = (expiresAt?: string | null, now: Date = new Date()): boolean => {
  if (!expiresAt) return true

  const deadline = Date.parse(expiresAt)
  return Number.isNaN(deadline) || deadline <= now.getTime()
}

/**
 * Comparaison à temps constant : deux jetons de longueurs différentes sont
 * refusés d'emblée (leur longueur est déjà publique), les autres passent par
 * `timingSafeEqual` pour ne rien laisser fuir sur le préfixe commun.
 *
 * La recherche en base, elle, reste une égalité SQL indexée : cette comparaison
 * est la vérification finale, pas le seul rempart.
 */
export const tokensMatch = (a?: string | null, b?: string | null): boolean => {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length === 0) return false

  const left = Buffer.from(a, 'utf8')
  const right = Buffer.from(b, 'utf8')

  return left.length === right.length && timingSafeEqual(left, right)
}
