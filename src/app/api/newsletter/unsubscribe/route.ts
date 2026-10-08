import { jsonError, readJsonBody, tooManyRequests } from '@/lib/api'
import { clientKey, createRateLimiter } from '@/lib/rateLimit'
import { unsubscribeByToken } from '@/lib/newsletter/subscribers'

/**
 * Désinscription par jeton, sans authentification (§ 4.4 : se désinscrire doit
 * être aussi simple que s'inscrire).
 *
 * Le lien cliquable inséré dans les envois Brevo pointe sur la page
 * `/newsletter/desinscription`. Cette route accepte un POST pour l'en-tête
 * `List-Unsubscribe-Post` des clients de messagerie, qui désabonnent sans
 * ouvrir de navigateur — et parce qu'une action destructrice déclenchée par un
 * simple GET peut être provoquée par un préchargement de lien.
 */

export const dynamic = 'force-dynamic'

const limiter = createRateLimiter({ limit: 20, windowMs: 60_000 })

export async function POST(request: Request): Promise<Response> {
  const verdict = limiter(clientKey(request))
  if (!verdict.allowed) return tooManyRequests(verdict)

  const body = await readJsonBody(request)
  const token =
    typeof body?.token === 'string'
      ? body.token
      : (new URL(request.url).searchParams.get('token') ?? '')

  const outcome = await unsubscribeByToken(token)

  switch (outcome) {
    case 'unsubscribed':
      return Response.json({ status: outcome, message: 'Votre désinscription est enregistrée.' })
    case 'already-unsubscribed':
      return Response.json({ status: outcome, message: 'Cette adresse est déjà désinscrite.' })
    default:
      return jsonError(404, 'Ce lien de désinscription n’est pas valide.')
  }
}
