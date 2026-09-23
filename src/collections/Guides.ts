import type { CollectionConfig } from 'payload'
import {
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { loggedIn, publishedOrLoggedIn } from '../access'
import { Callout } from '../blocks/Callout'
import { slugField } from '../fields/slug'
import { populatePublishedAt } from '../hooks/populatePublishedAt'
import { revalidateContent } from '../hooks/revalidateContent'
import { setReadingTime } from '../hooks/setReadingTime'

const { afterChange, afterDelete } = revalidateContent('/guides')

/**
 * Fiches pratiques longues, structurées par thème (cahier des charges § 2.2).
 * Elles partagent la taxonomie des articles (tags) et ajoutent des ressources
 * téléchargeables (modèles, PV type).
 */
export const Guides: CollectionConfig = {
  slug: 'guides',
  labels: {
    singular: 'Guide',
    plural: 'Guides',
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
    maxPerDoc: 50,
  },
  hooks: {
    beforeChange: [populatePublishedAt, setReadingTime],
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
  fields: [
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
            },
            {
              name: 'excerpt',
              type: 'textarea',
              label: 'Résumé',
              required: true,
              maxLength: 300,
              admin: {
                description:
                  'Résumé court affiché sous le titre et dans les listes. 300 caractères maximum.',
              },
            },
            {
              name: 'featuredImage',
              type: 'upload',
              label: 'Image mise en avant',
              relationTo: 'media',
              admin: {
                description: 'Illustration de tête, reprise dans le rail de l’accueil.',
              },
            },
            {
              name: 'content',
              type: 'richText',
              label: 'Corps du guide',
              required: true,
              editor: lexicalEditor({
                features: () => [
                  ParagraphFeature(),
                  // H1 réservé au titre de la page ; les h2 alimentent le sommaire.
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                  BoldFeature(),
                  ItalicFeature(),
                  UnorderedListFeature(),
                  OrderedListFeature(),
                  BlockquoteFeature(),
                  LinkFeature({ enabledCollections: ['articles', 'guides'] }),
                  UploadFeature({ enabledCollections: ['media'] }),
                  BlocksFeature({ blocks: [Callout] }),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                ],
              }),
            },
          ],
        },
        {
          label: 'Classement',
          fields: [
            {
              name: 'theme',
              type: 'relationship',
              label: 'Thème',
              relationTo: 'themes',
              required: true,
              hasMany: false,
              admin: {
                description: 'Détermine la couleur de bordure du guide (§ 5.3).',
              },
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
        {
          label: 'Ressources',
          fields: [
            {
              name: 'resources',
              type: 'array',
              label: 'Ressources téléchargeables',
              labels: {
                singular: 'Ressource',
                plural: 'Ressources',
              },
              admin: {
                description: 'Modèles, PV type… affichés dans la colonne du guide.',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  label: 'Intitulé',
                  required: true,
                },
                {
                  name: 'file',
                  type: 'upload',
                  label: 'Fichier',
                  relationTo: 'media',
                  required: true,
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
    {
      name: 'featuredOnHome',
      type: 'checkbox',
      label: 'Mettre en avant sur l’accueil',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Les guides cochés ouvrent le rail « Guides CSE » de la page d’accueil.',
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      label: 'Temps de lecture (min)',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Calculé automatiquement à partir du corps du guide.',
      },
    },
  ],
}
