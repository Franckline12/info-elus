/**
 * Opérations serveur du parcours d'abonnement (§ 2.6, § 4.4).
 *
 * Tout passe par la Local API : la collection `subscribers` est fermée au
 * public (aucun accès en lecture ni en écriture), et ces fonctions sont le seul
 * chemin par lequel un visiteur peut modifier son état d'abonnement. Les routes
 * HTTP et les pages du front s'appuient dessus sans jamais dupliquer la règle.
 */

import type { Payload } from 'payload'

import { getPayloadClient } from '@/lib/queries/payload'
import { absoluteUrl } from '@/lib/site'
import { newsletterConfirmationPath } from '@/lib/routes'
import { buildConfirmationEmail } from '@/emails/newsletterConfirmation'
import type { Subscriber } from '@/payload-types'

import { addContactToBrevoList, removeContactFromBrevoList } from './brevo'
import { normalizeEmail } from './email'
import { planSubscription, type SubscriptionAction } from './plan'
import { createToken, isTokenExpired, tokenExpiresAt, tokensMatch } from './tokens'

/** Recherche par égalité stricte : l'adresse est normalisée avant d'entrer en base. */
const findByEmail = async (payload: Payload, email: string): Promise<Subscriber | null> => {
  const { docs } = await payload.find({
    collection: 'subscribers',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return docs[0] ?? null
}

const findByToken = async (
  payload: Payload,
  field: 'confirmationToken' | 'unsubscribeToken',
  token: string,
): Promise<Subscriber | null> => {
  const { docs } = await payload.find({
    collection: 'subscribers',
    where: { [field]: { equals: token } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const doc = docs[0]

  // La recherche SQL a déjà tranché ; la comparaison à temps constant est la
  // vérification finale, et la seule à laquelle on accorde autorité.
  return doc && tokensMatch(doc[field], token) ? doc : null
}

export type SubscriptionRequest = {
  email: string
  /** Page d'où vient l'inscription, à titre informatif pour l'équipe. */
  source?: string
}

/**
 * Traite une demande d'inscription et envoie l'email de confirmation quand la
 * situation le justifie. Ne renvoie rien d'exploitable par l'appelant : la
 * réponse HTTP doit être identique dans les quatre cas (voir `messages.ts`).
 */
export const requestSubscription = async ({
  email: rawEmail,
  source,
}: SubscriptionRequest): Promise<SubscriptionAction> => {
  const payload = await getPayloadClient()
  const email = normalizeEmail(rawEmail)

  const existing = await findByEmail(payload, email)
  const { action, sendConfirmation } = planSubscription(existing)

  if (!sendConfirmation) return action

  const token = createToken()
  const now = new Date()

  const pendingState = {
    status: 'pending' as const,
    confirmationToken: token,
    tokenExpiresAt: tokenExpiresAt(now),
    subscribedAt: now.toISOString(),
    ...(source ? { source } : {}),
  }

  if (existing) {
    await payload.update({
      collection: 'subscribers',
      id: existing.id,
      data: pendingState,
      depth: 0,
      overrideAccess: true,
    })
  } else {
    await payload.create({
      collection: 'subscribers',
      data: {
        email,
        ...pendingState,
        // Émis dès la création : il doit survivre à l'effacement du jeton de
        // confirmation pour alimenter le lien de désinscription des envois.
        unsubscribeToken: createToken(),
      },
      depth: 0,
      overrideAccess: true,
    })
  }

  const { subject, html, text } = buildConfirmationEmail({
    confirmationUrl: absoluteUrl(newsletterConfirmationPath(token)),
  })

  try {
    await payload.sendEmail({ to: email, subject, html, text })
  } catch (error) {
    // L'abonné reste en attente : une nouvelle demande régénérera un jeton et
    // relancera l'envoi. Rien ne filtre vers le visiteur, la réponse HTTP est
    // la même dans tous les cas.
    payload.logger.error({ err: error }, 'Envoi de l’email de confirmation newsletter impossible')
  }

  return action
}

export type ConfirmationOutcome = 'confirmed' | 'already-confirmed' | 'expired' | 'invalid'

/**
 * Valide un jeton de confirmation et fait entrer l'abonné dans la liste.
 *
 * L'ajout du contact à Brevo est volontairement secondaire : une panne de
 * l'API tierce ne doit pas priver la personne de son consentement enregistré.
 * L'échec est journalisé, l'abonné reste `confirmed` en base.
 */
export const confirmSubscription = async (token: string): Promise<ConfirmationOutcome> => {
  if (!token) return 'invalid'

  const payload = await getPayloadClient()
  const subscriber = await findByToken(payload, 'confirmationToken', token)

  if (!subscriber) return 'invalid'
  if (subscriber.status === 'confirmed') return 'already-confirmed'

  // Un désinscrit qui rouvre un vieux lien de confirmation ne doit pas
  // réintégrer la liste par surprise : il lui faut repasser par le formulaire.
  if (subscriber.status !== 'pending') return 'invalid'

  if (isTokenExpired(subscriber.tokenExpiresAt)) return 'expired'

  const unsubscribeToken = subscriber.unsubscribeToken || createToken()

  await payload.update({
    collection: 'subscribers',
    id: subscriber.id,
    data: {
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      unsubscribedAt: null,
      // Jeton à usage unique : le lien reçu par email ne resservira pas.
      confirmationToken: null,
      tokenExpiresAt: null,
      unsubscribeToken,
    },
    depth: 0,
    overrideAccess: true,
  })

  await addContactToBrevoList(payload, { email: subscriber.email, unsubscribeToken })

  return 'confirmed'
}

export type UnsubscribeOutcome = 'unsubscribed' | 'already-unsubscribed' | 'invalid'

/**
 * Désinscription en un clic, sans authentification : le RGPD veut qu'elle soit
 * aussi simple que l'inscription. Le jeton est durable et propre à l'abonné.
 */
export const unsubscribeByToken = async (token: string): Promise<UnsubscribeOutcome> => {
  if (!token) return 'invalid'

  const payload = await getPayloadClient()
  const subscriber = await findByToken(payload, 'unsubscribeToken', token)

  if (!subscriber) return 'invalid'
  if (subscriber.status === 'unsubscribed') return 'already-unsubscribed'

  await payload.update({
    collection: 'subscribers',
    id: subscriber.id,
    data: {
      status: 'unsubscribed',
      unsubscribedAt: new Date().toISOString(),
      // Une demande de confirmation en cours devient caduque.
      confirmationToken: null,
      tokenExpiresAt: null,
    },
    depth: 0,
    overrideAccess: true,
  })

  await removeContactFromBrevoList(payload, { email: subscriber.email })

  return 'unsubscribed'
}
