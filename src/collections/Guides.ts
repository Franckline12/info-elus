import type { CollectionConfig } from 'payload'

import { loggedIn, publishedOrLoggedIn } from '../access'
import { contentEditor } from '../fields/contentEditor'
import { slugField } from '../fields/slug'
import { populatePublishedAt } from '../hooks/populatePublishedAt'
import { revalidateContent } from '../hooks/revalidateContent'
import { uniqueSectionAnchors } from '../hooks/sectionAnchors'

const { afterChange, afterDelete } = revalidateContent('/guides')

/**
 * Fiches pratiques longues, structurées par thème (cahier des charges § 2.2).
 *
 * Contrairement aux articles, le corps n'est pas un bloc de texte unique mais
 * une suite de sections : chacune porte son titre et son ancre, ce qui donne un
 * sommaire interne fiable sans avoir à deviner la structure du texte.
 *
 * Les guides partagent la taxonomie des articles (tags) et ajoutent des
 * ressources téléchargeables (modèles, PV type).
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
    listSearchableFields: ['title', 'summary'],
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
    beforeValidate: [uniqueSectionAnchors],
    beforeChange: [populatePublishedAt],
    afterChange: [afterChange],
    afterDelete: [afterDelete],
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
            },
            {
              name: 'summary',
              type: 'textarea',
              label: 'Résumé court',
              required: true,
              maxLength: 300,
              admin: {
                description:
                  'Affiché sous le titre, dans le listing et dans le rail de l’accueil. 300 caractères maximum.',
              },
            },
            {
              name: 'featuredImage',
              type: 'upload',
              label: 'Image mise en avant',
              relationTo: 'media',
              admin: {
                description: 'Illustration de tête, reprise dans l’aperçu social.',
              },
            },
            {
              name: 'sections',
              type: 'array',
              label: 'Sections',
              labels: {
                singular: 'Section',
                plural: 'Sections',
              },
              required: true,
              minRows: 1,
              admin: {
                initCollapsed: true,
                description:
                  'Chaque section alimente le sommaire interne du guide, dans l’ordre du tableau.',
                components: {
                  RowLabel: '@/components/admin/GuideSectionRowLabel#GuideSectionRowLabel',
                },
              },
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  label: 'Titre de la section',
                  required: true,
                },
                {
                  name: 'anchor',
                  type: 'text',
                  label: 'Ancre',
                  admin: {
                    readOnly: true,
                    description:
                      'Dérivée du titre de la section, rendue unique automatiquement. Elle sert de lien dans le sommaire.',
                  },
                },
                {
                  name: 'content',
                  type: 'richText',
                  label: 'Contenu',
                  required: true,
                  editor: contentEditor({ linkTo: ['articles', 'guides'] }),
                },
              ],
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
                description: 'Modèles, PV type… affichés en fin de guide.',
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
                {
                  name: 'description',
                  type: 'text',
                  label: 'Description',
                  admin: {
                    description: 'Précision facultative affichée sous l’intitulé.',
                  },
                },
              ],
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
  ],
}
