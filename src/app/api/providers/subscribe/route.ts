import { jsonError, readJsonBody, tooManyRequests } from '@/lib/api'
import { clientKey, createRateLimiter } from '@/lib/rateLimit'
import { getPayloadClient } from '@/lib/queries/payload'
import { isValidEmail } from '@/lib/newsletter/email'

export const dynamic = 'force-dynamic'

/** Limiteur de débit : 5 demandes par 15 minutes par IP pour éviter le spam. */
const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60_000 })

export async function POST(request: Request): Promise<Response> {
  const verdict = limiter(clientKey(request))
  if (!verdict.allowed) return tooManyRequests(verdict)

  const body = await readJsonBody(request)
  if (!body) return jsonError(400, 'Corps de requête JSON attendu.')

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (!isValidEmail(email)) {
    return jsonError(400, 'Adresse email invalide.')
  }

  const nom = typeof body.nom === 'string' ? body.nom.trim() : ''
  const prenom = typeof body.prenom === 'string' ? body.prenom.trim() : ''
  const company =
    typeof body.company === 'string'
      ? body.company.trim()
      : typeof body.entrepriseCse === 'string'
        ? body.entrepriseCse.trim()
        : ''

  if (!nom || !prenom) {
    return jsonError(400, 'Le nom et le prénom sont requis.')
  }

  if (!company) {
    return jsonError(400, 'Le nom de l’entreprise ou de la structure est requis.')
  }

  const payload = await getPayloadClient()

  try {
    await payload.create({
      collection: 'provider-subscriptions',
      data: {
        nom,
        prenom,
        email,
        company,
        status: 'pending',
      },
      depth: 0,
      overrideAccess: true,
    })
  } catch (error) {
    payload.logger.error({ err: error }, 'Enregistrement de la demande d’abonnement prestataire impossible')
    return jsonError(500, 'L’enregistrement de la demande a échoué. Veuillez réessayer ultérieurement.')
  }

  return Response.json({
    success: true,
    message: 'Votre demande d’abonnement a été enregistrée avec succès. Notre équipe va prendre contact avec vous pour finaliser votre mise en avant grand format.',
  })
}
