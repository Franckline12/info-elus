import { jsonError, tooManyRequests } from '@/lib/api'
import { clientKey, createRateLimiter } from '@/lib/rateLimit'
import { confirmSubscription } from '@/lib/newsletter/subscribers'

/**
 * Second temps du double opt-in (§ 4.4) : validation du jeton reçu par email.
 *
 * Le lien envoyé aux abonnés pointe sur la page `/newsletter/confirmation`, qui
 * appelle la même fonction serveur — cette route JSON existe pour les appels
 * programmatiques (supervision, tests de bout en bout) et ne duplique aucune
 * règle.
 */

export const dynamic = 'force-dynamic'

/** Un jeton inconnu coûte une requête en base : on borne les essais à l'aveugle. */
const limiter = createRateLimiter({ limit: 20, windowMs: 60_000 })

export async function GET(request: Request): Promise<Response> {
  const verdict = limiter(clientKey(request))
  if (!verdict.allowed) return tooManyRequests(verdict)

  const token = new URL(request.url).searchParams.get('token') ?? ''
  const outcome = await confirmSubscription(token)

  switch (outcome) {
    case 'confirmed':
      return Response.json({ status: outcome, message: 'Votre inscription est confirmée.' })
    case 'already-confirmed':
      return Response.json({ status: outcome, message: 'Cette adresse est déjà confirmée.' })
    case 'expired':
      return jsonError(410, 'Ce lien de confirmation a expiré.')
    default:
      return jsonError(404, 'Ce lien de confirmation n’est pas valide.')
  }
}
