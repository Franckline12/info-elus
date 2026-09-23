import type { CollectionConfig } from 'payload'

import { loggedIn, publishedOrLoggedIn } from '../access'
import { slugField } from '../fields/slug'
import { populatePublishedAt } from '../hooks/populatePublishedAt'
import { revalidateContent } from '../hooks/revalidateContent'

const { afterChange, afterDelete } = revalidateContent('/jeux-quiz')

/**
 * Quiz de culture générale sur le droit du travail et le CSE (§ 2.5).
 * Les questions sont saisies directement dans le quiz : elles n'ont pas
 * d'existence propre en dehors de lui.
 */
export const Quizzes: CollectionConfig = {
  slug: 'quizzes',
  labels: {
    singular: 'Quiz',
    plural: 'Quiz',
  },
  admin: {
    group: 'Contenus',
    useAsTitle: 'title',
    defaultColumns: ['title', 'theme', '_status', 'publishedAt'],
    listSearchableFields: ['title', 'excerpt'],
  },
  access: {
    read: publishedOrLoggedIn,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 20,
  },
  hooks: {
    beforeChange: [populatePublishedAt],
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Présentation',
      required: true,
      maxLength: 300,
      admin: {
        description: 'Phrase d’accroche affichée avant de lancer le quiz.',
      },
    },
    {
      name: 'theme',
      type: 'relationship',
      label: 'Thème',
      relationTo: 'themes',
      hasMany: false,
    },
    {
      name: 'questions',
      type: 'array',
      label: 'Questions',
      labels: {
        singular: 'Question',
        plural: 'Questions',
      },
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'prompt',
          type: 'textarea',
          label: 'Énoncé',
          required: true,
        },
        {
          name: 'options',
          type: 'array',
          label: 'Réponses proposées',
          labels: {
            singular: 'Réponse',
            plural: 'Réponses',
          },
          required: true,
          minRows: 2,
          maxRows: 6,
          fields: [
            {
              name: 'text',
              type: 'text',
              label: 'Intitulé',
              required: true,
            },
            {
              name: 'isCorrect',
              type: 'checkbox',
              label: 'Bonne réponse',
              defaultValue: false,
            },
          ],
          // Une question à choix multiple n'a qu'une bonne réponse : la
          // restitution du score et le retour immédiat en dépendent (§ 2.5).
          validate: (value: unknown) => {
            if (!Array.isArray(value)) return true

            const correct = value.filter(
              (option) => (option as { isCorrect?: boolean } | null)?.isCorrect,
            ).length

            if (correct === 1) return true

            return correct === 0
              ? 'Cochez la bonne réponse.'
              : 'Une seule réponse peut être cochée comme bonne réponse.'
          },
        },
        {
          name: 'explanation',
          type: 'textarea',
          label: 'Explication',
          admin: {
            description: 'Affichée après validation de la réponse. Facultative.',
          },
        },
      ],
    },
    slugField('title'),
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Date de publication',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Renseignée automatiquement à la première publication si elle est vide.',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'd MMM yyyy HH:mm',
        },
      },
    },
  ],
}
