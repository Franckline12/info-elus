import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '../access'
import { slugField } from '../fields/slug'

export const Themes: CollectionConfig = {
  slug: 'themes',
  labels: {
    singular: 'Thème',
    plural: 'Thèmes',
  },
  admin: {
    group: 'Taxonomies',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'color', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nom',
      required: true,
    },
    slugField('name'),
    {
      name: 'color',
      type: 'select',
      label: 'Couleur',
      required: true,
      defaultValue: 'blue-mid',
      // L'ocre (--color-accent-quiz) est réservé à la section Jeux & Quiz.
      options: [
        { value: 'blue-deep', label: 'Bleu profond' },
        { value: 'blue-mid', label: 'Bleu moyen' },
        { value: 'blue-bright', label: 'Bleu vif' },
      ],
      admin: {
        description: 'Couleur de bordure des guides de ce thème',
      },
    },
  ],
}
