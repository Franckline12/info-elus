import type { CollectionConfig } from 'payload'

import { loggedIn } from '../access'
import { EMAIL_MAX_LENGTH, isValidEmail, normalizeEmail } from '../lib/newsletter/email'

/**
 * Abonnés à la lettre hebdomadaire (§ 2.6 et § 4.2).
 *
 * Le double opt-in du § 4.4 vit dans le champ `status` : une adresse ne rejoint
 * la liste de diffusion qu'après être passée de `pending` à `confirmed` par un
 * clic sur le lien reçu par email. Aucun envoi commercial avant cela.
 *
 * RGPD : la liste n'est jamais lisible publiquement, dans aucun sens (voir
 * `access` plus bas), les jetons sont masqués dans l'admin, et les inscriptions
 * restées en attente au-delà de la validité du jeton sont supprimées par
 * `npm run purge:subscribers` — elles n'ont plus de base légale.
 */
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: {
    singular: 'Abonné',
    plural: 'Abonnés',
  },
  admin: {
    group: 'Données',
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'subscribedAt'],
    description:
      'Inscriptions à la lettre hebdomadaire. Seules les adresses « Confirmé » ont donné leur consentement (double opt-in) et peuvent être contactées.',
  },
  /**
   * Aucun accès public, dans aucun sens : une liste d'emails exposée par l'API
   * REST ou GraphQL serait une fuite de données personnelles. Les inscriptions
   * du public passent par les routes `/api/newsletter/*`, qui écrivent via la
   * Local API côté serveur.
   */
  access: {
    read: loggedIn,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  fields: [
    {
      name: 'email',
      type: 'text',
      label: 'Adresse email',
      required: true,
      unique: true,
      index: true,
      maxLength: EMAIL_MAX_LENGTH,
      hooks: {
        // L'adresse est la clé d'unicité : sans normalisation, « Elu@CSE.fr »
        // et « elu@cse.fr » feraient deux abonnés pour une seule personne.
        beforeValidate: [
          ({ value }) => (typeof value === 'string' ? normalizeEmail(value) : value),
        ],
      },
      validate: (value: string | null | undefined) =>
        isValidEmail(value) || 'Cette adresse email ne semble pas valide.',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'En attente de confirmation', value: 'pending' },
        { label: 'Confirmé', value: 'confirmed' },
        { label: 'Désinscrit', value: 'unsubscribed' },
      ],
      admin: {
        description:
          'Passe à « Confirmé » quand la personne clique sur le lien reçu par email. Ne le modifiez pas à la main : ce serait inscrire quelqu’un sans son consentement.',
      },
    },
    {
      name: 'confirmationToken',
      type: 'text',
      label: 'Jeton de confirmation',
      index: true,
      admin: {
        // Un secret n'a rien à faire sous les yeux de l'équipe éditoriale :
        // le connaître permettrait de confirmer une adresse à la place de son
        // titulaire. La lecture reste possible côté serveur (Local API).
        hidden: true,
      },
    },
    {
      name: 'tokenExpiresAt',
      type: 'date',
      label: 'Jeton valable jusqu’au',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy HH:mm' },
        description: 'Au-delà, le lien de confirmation ne fonctionne plus (7 jours).',
      },
    },
    {
      name: 'unsubscribeToken',
      type: 'text',
      label: 'Jeton de désinscription',
      index: true,
      admin: {
        // Durable, contrairement au jeton de confirmation : il voyage dans
        // chaque lettre pour que la désinscription se fasse en un clic, sans
        // authentification (§ 4.4). Il est poussé vers Brevo comme attribut de
        // contact à la confirmation.
        hidden: true,
      },
    },
    {
      name: 'subscribedAt',
      type: 'date',
      label: 'Demande d’inscription',
      index: true,
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy HH:mm' },
      },
    },
    {
      name: 'confirmedAt',
      type: 'date',
      label: 'Consentement confirmé le',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy HH:mm' },
        description: 'Preuve du consentement à conserver (§ 4.4).',
      },
    },
    {
      name: 'unsubscribedAt',
      type: 'date',
      label: 'Désinscrit le',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy HH:mm' },
      },
    },
    {
      name: 'source',
      type: 'text',
      label: 'Origine',
      admin: {
        readOnly: true,
        description: 'Page depuis laquelle l’inscription a été demandée.',
      },
    },
  ],
}
