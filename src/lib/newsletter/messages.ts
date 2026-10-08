/**
 * Messages publics du parcours newsletter, partagés par les routes d'API et
 * par les pages/formulaires du front pour ne les écrire qu'une fois.
 */

/**
 * Réponse unique de `/api/newsletter/subscribe`, quel que soit l'état de
 * l'adresse. Si le message distinguait « nouvelle inscription » de « déjà
 * inscrit », le formulaire deviendrait un oracle permettant de tester
 * l'appartenance d'une adresse à la liste — une fuite de donnée personnelle.
 */
export const SUBSCRIBE_SUCCESS =
  'Merci ! Si cette adresse peut être inscrite, un email de confirmation vient de lui être envoyé. Cliquez sur le lien qu’il contient pour valider votre inscription.'

export const INVALID_EMAIL = 'Cette adresse email ne semble pas valide.'

/** Fréquence annoncée partout : formulaire, email de confirmation, pages. */
export const NEWSLETTER_FREQUENCY = 'une fois par semaine'

export const CONSENT_NOTICE =
  'En vous inscrivant, vous acceptez de recevoir la lettre hebdomadaire d’Infos Élus. Désinscription possible à tout moment.'
