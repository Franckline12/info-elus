import type { CollectionConfig } from 'payload'

import { anyone, loggedIn } from '../access'

/**
 * Demandes d'abonnement des prestataires souhaitant être mis en avant
 * dans l'annuaire d'Infos Élus en grand format.
 */
export const ProviderSubscriptions: CollectionConfig = {
  slug: 'provider-subscriptions',
  labels: {
    singular: 'Abonnement prestataire',
    plural: 'Abonnements prestataires',
  },
  admin: {
    group: 'Données',
    useAsTitle: 'company',
    defaultColumns: ['company', 'nom', 'prenom', 'email', 'status', 'createdAt'],
    description:
      'Demandes d’abonnement des prestataires souhaitant être mis en avant dans l’annuaire en grand format.',
  },
  access: {
    create: anyone,
    read: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  fields: [
    {
      name: 'company',
      type: 'text',
      label: 'Nom de l’entreprise / CSE',
      required: true,
      index: true,
      admin: {
        description: 'Nom de la structure prestataire ou de l’entreprise.',
      },
    },
    {
      name: 'nom',
      type: 'text',
      label: 'Nom',
      required: true,
      index: true,
    },
    {
      name: 'prenom',
      type: 'text',
      label: 'Prénom',
      required: true,
      index: true,
    },
    {
      name: 'email',
      type: 'email',
      label: 'Adresse email',
      required: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      label: 'Statut de l’abonnement',
      defaultValue: 'pending',
      required: true,
      options: [
        { label: 'En attente', value: 'pending' },
        { label: 'Abonné (Actif)', value: 'active' },
        { label: 'Annulé', value: 'cancelled' },
      ],
      admin: {
        description:
          'Passez le statut à « Abonné (Actif) » pour valider la demande (le mode de paiement sera connecté ultérieurement).',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes internes',
      admin: {
        description: 'Informations de suivi commercial, contact ou facturation.',
      },
    },
  ],
}
