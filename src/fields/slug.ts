import type { Field } from 'payload'

import { formatSlugHook } from '../hooks/formatSlug'

/**
 * Champ slug réutilisable : généré depuis `sourceField` s'il est laissé vide,
 * normalisé même quand il est saisi à la main.
 */
export const slugField = (sourceField: string = 'name'): Field => ({
  name: 'slug',
  type: 'text',
  label: 'Slug',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Généré automatiquement depuis le titre. Modifiable, il sera normalisé.',
  },
  hooks: {
    beforeValidate: [formatSlugHook(sourceField)],
  },
})
