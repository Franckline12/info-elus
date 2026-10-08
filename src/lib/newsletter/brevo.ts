/**
 * Synchronisation de la liste de diffusion Brevo (§ 6).
 *
 * Règle de conception : ces appels ne lèvent jamais. La base Payload fait foi
 * pour le consentement (§ 4.4) ; une panne de l'API tierce ne doit ni empêcher
 * une confirmation, ni empêcher une désinscription. Les échecs sont journalisés
 * pour être rattrapés à la main.
 */

import type { Payload } from 'payload'

const BREVO_ENDPOINT = 'https://api.brevo.com/v3'

/**
 * Attribut de contact portant le jeton, pour composer le lien de désinscription
 * dans les modèles Brevo : `{{ contact.UNSUB_TOKEN }}`.
 *
 * L'attribut doit exister dans le compte Brevo, sinon il est ignoré en silence
 * à l'ajout du contact (aucune erreur renvoyée). Il se déclare une fois par
 * compte, depuis Contacts → Paramètres → Attributs, ou en une commande :
 *
 *   curl -X POST https://api.brevo.com/v3/contacts/attributes/normal/UNSUB_TOKEN \
 *     -H "api-key: $BREVO_API_KEY" -H "content-type: application/json" \
 *     -d '{"type":"text"}'
 */
const UNSUBSCRIBE_TOKEN_ATTRIBUTE = 'UNSUB_TOKEN'

type BrevoConfig = { apiKey: string; listId: number }

const readConfig = (payload: Payload): BrevoConfig | null => {
  const apiKey = process.env.BREVO_API_KEY
  const listId = Number(process.env.BREVO_LIST_ID)

  if (!apiKey || !Number.isInteger(listId) || listId <= 0) {
    payload.logger.warn(
      'BREVO_API_KEY ou BREVO_LIST_ID absent : la liste de diffusion n’est pas synchronisée.',
    )
    return null
  }

  return { apiKey, listId }
}

const call = async (
  payload: Payload,
  { apiKey }: BrevoConfig,
  path: string,
  body: unknown,
): Promise<boolean> => {
  try {
    const response = await fetch(`${BREVO_ENDPOINT}${path}`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (response.ok) return true

    payload.logger.error(
      { status: response.status, detail: await response.text() },
      `Appel Brevo ${path} en échec`,
    )
    return false
  } catch (error) {
    payload.logger.error({ err: error }, `Appel Brevo ${path} impossible`)
    return false
  }
}

/**
 * Ajoute (ou met à jour) le contact dans la liste. `updateEnabled` évite une
 * erreur 400 si l'adresse existe déjà côté Brevo, par exemple après une
 * désinscription suivie d'une réinscription.
 */
export const addContactToBrevoList = async (
  payload: Payload,
  { email, unsubscribeToken }: { email: string; unsubscribeToken?: string | null },
): Promise<boolean> => {
  const config = readConfig(payload)
  if (!config) return false

  return call(payload, config, '/contacts', {
    email,
    listIds: [config.listId],
    updateEnabled: true,
    ...(unsubscribeToken
      ? { attributes: { [UNSUBSCRIBE_TOKEN_ATTRIBUTE]: unsubscribeToken } }
      : {}),
  })
}

/**
 * Retire le contact de la liste. Le contact n'est pas supprimé du compte Brevo :
 * son historique d'envoi reste consultable, mais il ne reçoit plus la lettre.
 */
export const removeContactFromBrevoList = async (
  payload: Payload,
  { email }: { email: string },
): Promise<boolean> => {
  const config = readConfig(payload)
  if (!config) return false

  return call(payload, config, `/contacts/lists/${config.listId}/contacts/remove`, {
    emails: [email],
  })
}
