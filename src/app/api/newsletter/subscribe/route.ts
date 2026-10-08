import { jsonError, readJsonBody, tooManyRequests } from '@/lib/api'
import { clientKey, createRateLimiter } from '@/lib/rateLimit'
import { isValidEmail } from '@/lib/newsletter/email'
import { INVALID_EMAIL, SUBSCRIBE_SUCCESS } from '@/lib/newsletter/messages'
import { requestSubscription } from '@/lib/newsletter/subscribers'

/**
 * Demande d'inscription à la lettre hebdomadaire (§ 2.6).
 *
 * Premier temps du double opt-in (§ 4.4) : cette route n'inscrit personne, elle
 * enregistre une demande en attente et envoie un email de confirmation. Rien
 * n'est envoyé d'autre tant que le lien n'a pas été suivi.
 *
 * La réponse est identique dans les quatre situations possibles (adresse
 * inconnue, déjà en attente, déjà confirmée, désinscrite). Répondre « vous êtes
 * déjà inscrit » ferait du formulaire un moyen de vérifier l'appartenance d'une
 * adresse à la liste : une fuite de donnée personnelle, offerte à n'importe qui.
 *
 * L'adresse IP sert uniquement de clé de comptage pour la limitation de débit
 * (en mémoire, le temps de la fenêtre) ; elle n'est jamais écrite en base.
 */

export const dynamic = 'force-dynamic'

/** Chaque demande peut déclencher un email : cinq par quart d'heure et par IP. */
const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60_000 })

/**
 * Champ piège : invisible et hors du parcours clavier côté formulaire, donc
 * jamais rempli par un humain. Un robot qui remplit tout se trahit.
 */
const HONEYPOT_FIELD = 'website'

const success = (): Response => Response.json({ message: SUBSCRIBE_SUCCESS })

export async function POST(request: Request): Promise<Response> {
  const verdict = limiter(clientKey(request))
  if (!verdict.allowed) return tooManyRequests(verdict)

  const body = await readJsonBody(request)
  if (!body) return jsonError(400, 'Corps de requête JSON attendu.')

  // Robot démasqué : on répond comme à une inscription réussie, sans rien
  // écrire ni envoyer. Lui signaler le piège l'aiderait à le contourner.
  const honeypot = body[HONEYPOT_FIELD]
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) return success()

  if (!isValidEmail(body.email)) return jsonError(400, INVALID_EMAIL)

  const source = typeof body.source === 'string' ? body.source.slice(0, 120) : undefined

  await requestSubscription({ email: body.email, source })

  return success()
}
