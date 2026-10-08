/**
 * Limitation de débit minimale, en mémoire du processus.
 *
 * L'adresse IP sert uniquement de clé de comptage : elle n'est jamais écrite en
 * base ni journalisée (§ 4.4 — la collection des résultats ne contient aucune
 * donnée personnelle). Les compteurs vivent le temps de la fenêtre.
 *
 * Limite assumée : le compteur est local à l'instance. Derrière plusieurs
 * instances, il faudra une limitation partagée (Redis ou le reverse proxy).
 */

type Bucket = {
  count: number
  /** Fin de la fenêtre courante, en millisecondes epoch. */
  resetAt: number
}

export type RateLimitVerdict = {
  allowed: boolean
  /** Secondes à attendre avant une nouvelle tentative (`Retry-After`). */
  retryAfter: number
  remaining: number
}

export type RateLimiter = (key: string, now?: number) => RateLimitVerdict

/** Purge opportuniste : une entrée par IP active, jamais de nettoyage périodique. */
const sweep = (buckets: Map<string, Bucket>, now: number) => {
  if (buckets.size < 500) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

/** Fabrique un limiteur autorisant `limit` appels par fenêtre de `windowMs`. */
export const createRateLimiter = ({
  limit,
  windowMs,
}: {
  limit: number
  windowMs: number
}): RateLimiter => {
  const buckets = new Map<string, Bucket>()

  return (key, now = Date.now()) => {
    sweep(buckets, now)

    const bucket = buckets.get(key)

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      return { allowed: true, retryAfter: 0, remaining: limit - 1 }
    }

    bucket.count += 1

    if (bucket.count > limit) {
      return {
        allowed: false,
        retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
        remaining: 0,
      }
    }

    return { allowed: true, retryAfter: 0, remaining: limit - bucket.count }
  }
}

/**
 * Clé de comptage d'une requête. `x-forwarded-for` n'est fiable que derrière un
 * proxy de confiance ; à défaut, tous les appels partagent la clé `inconnue`,
 * ce qui reste un garde-fou acceptable pour un enregistrement de score.
 */
export const clientKey = (request: Request): string => {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim()

  return ip && ip.length > 0 ? ip : 'inconnue'
}
