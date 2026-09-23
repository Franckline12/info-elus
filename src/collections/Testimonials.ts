import type { CollectionConfig } from 'payload'

import { loggedIn, publishedOrLoggedIn } from '../access'
import { revalidateContent } from '../hooks/revalidateContent'

const { afterChange, afterDelete } = revalidateContent('/')

/**
 * Paroles d'élus affichées en rotation à côté du bloc newsletter de l'accueil
 * (cahier des charges § 2.6, bloc « témoignage d'élu »).
 */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: 'Témoignage',
    plural: 'Témoignages',
  },
  admin: {
    group: 'Contenus',
    useAsTitle: 'quote',
    defaultColumns: ['quote', 'author', '_status'],
  },
  access: {
    read: publishedOrLoggedIn,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  hooks: {
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      label: 'Citation',
      required: true,
      maxLength: 220,
      admin: {
        description: 'Une à deux phrases. Les guillemets sont ajoutés à l’affichage.',
      },
    },
    {
      name: 'author',
      type: 'text',
      label: 'Auteur',
      admin: {
        description: 'Prénom et initiale, ou « Un élu de CSE ». Facultatif.',
      },
    },
    {
      name: 'role',
      type: 'text',
      label: 'Mandat',
      admin: {
        description: 'Par exemple « Secrétaire de CSE, 240 salariés ». Facultatif.',
      },
    },
  ],
}
