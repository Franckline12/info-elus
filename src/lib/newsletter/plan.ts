/**
 * Décision prise à la réception d'une demande d'inscription, isolée de Payload
 * pour rester testable : c'est ici que vivent les quatre cas du § 4.4.
 *
 * Aucun de ces quatre cas ne change la réponse renvoyée au visiteur — voir
 * `messages.ts`.
 */

import type { Subscriber } from '@/payload-types'

export type SubscriptionAction =
  /** Adresse inconnue : création en attente de confirmation. */
  | 'create'
  /** Déjà en attente : nouveau jeton, l'email précédent a pu se perdre. */
  | 'renew'
  /** Désinscrit : retour en attente, la confirmation est redemandée. */
  | 'reactivate'
  /** Déjà confirmé : on ne touche à rien et on n'envoie rien. */
  | 'none'

export type SubscriptionPlan = {
  action: SubscriptionAction
  /** Un email de confirmation part-il ? Jamais pour un abonné déjà confirmé. */
  sendConfirmation: boolean
}

/**
 * Un abonné déjà confirmé ne reçoit pas d'email : le renvoyer ferait du
 * formulaire un outil de harcèlement (n'importe qui peut saisir l'adresse d'un
 * tiers) et n'apporterait rien, la personne étant déjà sur la liste.
 */
export const planSubscription = (existing: Pick<Subscriber, 'status'> | null): SubscriptionPlan => {
  if (!existing) return { action: 'create', sendConfirmation: true }

  switch (existing.status) {
    case 'confirmed':
      return { action: 'none', sendConfirmation: false }
    case 'unsubscribed':
      return { action: 'reactivate', sendConfirmation: true }
    default:
      return { action: 'renew', sendConfirmation: true }
  }
}
