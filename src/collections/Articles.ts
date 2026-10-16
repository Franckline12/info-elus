import type { CollectionConfig } from 'payload'

import { loggedIn, publishedOrLoggedIn } from '../access'
import { contentEditor } from '../fields/contentEditor'
import { slugField } from '../fields/slug'
import { ensureSingleFeaturedNews } from '../hooks/ensureSingleFeaturedNews'
import { populatePublishedAt } from '../hooks/populatePublishedAt'
import { revalidateArticle, revalidateArticleDelete } from '../hooks/revalidateArticle'
import { setReadingTime } from '../hooks/setReadingTime'
import { minImageWidth } from '../lib/media/minImageWidth'

/**
 * Articles de fond et actualité : même modèle de données, seul le champ `type`
 * (et donc l'affichage côté front) les distingue.
 */
export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: 'Article',
    plural: 'Articles',
  },
  admin: {
    group: 'Contenus',
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'category', '_status', 'publishedAt'],
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
    maxPerDoc: 50,
  },
  hooks: {
    beforeChange: [populatePublishedAt, setReadingTime],
    afterChange: [ensureSingleFeaturedNews, revalidateArticle],
    afterDelete: [revalidateArticleDelete],
  },
  fields: [
    // Le plugin SEO ajoute son onglet à la suite de ceux-ci : ce champ `tabs`
    // doit rester en première position.
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
              name: 'excerpt',
              type: 'textarea',
              label: 'Chapô',
              required: true,
              maxLength: 300,
              admin: {
                description:
                  'Résumé d’accroche affiché sous le titre, dans les listes et les partages. 300 caractères maximum.',
              },
            },
            {
              name: 'featuredImage',
              type: 'upload',
              label: 'Image mise en avant',
              relationTo: 'media',
              validate: minImageWidth(1200),
              admin: {
                description:
                  'Illustration de tête, reprise dans les listes et l’aperçu social. 1200px de large minimum (affichage en grand format).',
              },
            },
            {
              name: 'content',
              type: 'richText',
              label: 'Corps de l’article',
              required: true,
              editor: contentEditor(),
            },
          ],
        },
        {
          label: 'Classement',
          fields: [
            {
              name: 'category',
              type: 'relationship',
              label: 'Catégorie',
              relationTo: 'categories',
              required: true,
              hasMany: false,
            },
            {
              name: 'tags',
              type: 'relationship',
              label: 'Tags',
              relationTo: 'tags',
              hasMany: true,
            },
          ],
        },
      ],
    },
    slugField('title'),
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      required: true,
      defaultValue: 'article',
      index: true,
      options: [
        { value: 'article', label: 'Article de fond' },
        { value: 'news', label: 'Actualité' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
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
    {
      name: 'featuredOnHome',
      type: 'checkbox',
      label: 'À la une (page d’accueil)',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        condition: (data) => data?.type === 'article',
        description: 'Plusieurs articles peuvent être à la une.',
      },
    },
    {
      name: 'featuredInNews',
      type: 'checkbox',
      label: 'Grand format (actualité)',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        condition: (data) => data?.type === 'news',
        description: 'Une seule actualité à la fois : cocher ici décoche les autres.',
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      label: 'Temps de lecture (min)',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Calculé automatiquement à partir du corps de l’article.',
      },
    },
  ],
}
