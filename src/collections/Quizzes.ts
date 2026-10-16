import type { CollectionConfig } from 'payload'

import { loggedIn, publishedOrLoggedIn } from '../access'
import { slugField } from '../fields/slug'
import { populatePublishedAt } from '../hooks/populatePublishedAt'
import { revalidateContent } from '../hooks/revalidateContent'
import { validateQuestions } from '../lib/quiz/questions'

const { afterChange, afterDelete } = revalidateContent('/jeux-quiz')

/**
 * Quiz hebdomadaire de culture générale sur le droit du travail et le CSE
 * (§ 2.5). Les questions sont saisies dans le quiz : elles n'ont pas
 * d'existence propre en dehors de lui.
 *
 * Les bonnes réponses et les explications ne quittent jamais le serveur tant
 * que le joueur n'a pas répondu : la page de jeu ne reçoit que les énoncés et
 * les intitulés d'options (`src/lib/quiz/playable.ts`), la correction est
 * demandée à l'API question par question.
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
    defaultColumns: ['title', 'theme', 'week', '_status', 'publishedAt'],
    listSearchableFields: ['title', 'intro'],
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
    // Le plugin SEO ajoute son onglet à la suite de ceux-ci : ce champ `tabs`
    // doit rester en première position, et les champs de la barre latérale en
    // dehors de lui.
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenu',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Titre',
              required: true,
              maxLength: 120,
              admin: {
                description:
                  'Au-delà de 120 caractères, le titre casse la mise en page du grand format et est tronqué par Google.',
              },
            },
            {
              name: 'intro',
              type: 'textarea',
              label: 'Introduction',
              maxLength: 300,
              admin: {
                description:
                  'Phrase d’accroche affichée avant de lancer le quiz et reprise dans la vignette du listing. 300 caractères maximum.',
              },
            },
            {
              name: 'theme',
              type: 'relationship',
              label: 'Thème',
              relationTo: 'themes',
              required: true,
              hasMany: false,
              admin: {
                description: 'Classe le quiz dans la même taxonomie que les guides.',
              },
            },
            {
              name: 'week',
              type: 'date',
              label: 'Semaine de publication',
              required: true,
              index: true,
              admin: {
                description:
                  'Lundi de la semaine concernée. Le quiz mis en avant est le plus récent dont la semaine est arrivée.',
                date: {
                  pickerAppearance: 'dayOnly',
                  displayFormat: 'd MMM yyyy',
                },
              },
            },
          ],
        },
        {
          label: 'Questions',
          fields: [
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
              admin: {
                initCollapsed: true,
                description:
                  'Chaque question doit compter au moins deux réponses proposées et une seule réponse correcte.',
                components: {
                  RowLabel: {
                    path: '@/components/admin/ArrayRowLabel#ArrayRowLabel',
                    clientProps: { fallback: 'Question' },
                  },
                },
              },
              /**
               * Une question sans bonne réponse — ou avec plusieurs — casserait
               * le parcours de jeu et le calcul du score. Payload exécute ce
               * `validate` côté admin comme côté API, et l'ignore sur les
               * enregistrements de brouillon : un quiz en cours de rédaction
               * reste enregistrable, il ne peut simplement pas être publié.
               */
              validate: validateQuestions,
              fields: [
                {
                  name: 'prompt',
                  type: 'textarea',
                  label: 'Énoncé',
                  required: true,
                  maxLength: 300,
                  admin: {
                    description: '300 caractères maximum.',
                  },
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
                      maxLength: 150,
                      admin: {
                        description: '150 caractères maximum.',
                      },
                    },
                    {
                      name: 'isCorrect',
                      type: 'checkbox',
                      label: 'Réponse correcte',
                      defaultValue: false,
                    },
                  ],
                },
                {
                  name: 'explanation',
                  type: 'textarea',
                  label: 'Explication',
                  maxLength: 500,
                  admin: {
                    description:
                      'Affichée juste après la réponse du joueur. Facultative, mais vivement recommandée : c’est elle qui donne sa valeur pédagogique au quiz. 500 caractères maximum.',
                  },
                },
                {
                  name: 'points',
                  type: 'number',
                  label: 'Points',
                  defaultValue: 1,
                  min: 0,
                  admin: {
                    description:
                      'Laissez 1 sauf si la question doit peser davantage dans le score.',
                  },
                },
              ],
            },
          ],
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
