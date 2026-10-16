import type { CollectionConfig, TextFieldSingleValidation } from 'payload'

import { loggedIn, publishedFlagOrLoggedIn } from '../access'
import { profileEditor } from '../fields/contentEditor'
import { slugField } from '../fields/slug'
import { byPublishedFlag, revalidateContent } from '../hooks/revalidateContent'
import { interventionAreaOptions } from '../lib/interventionAreas'

const { afterChange, afterDelete } = revalidateContent('/prestataires', {
  isPublished: byPublishedFlag,
})

/**
 * Adresse d'un site tiers : on exige une URL absolue en http(s), sans quoi le
 * lien de la fiche partirait vers une page interne du site.
 */
const validateWebsite: TextFieldSingleValidation = (value) => {
  if (!value) return true

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return 'Adresse invalide : saisissez l’URL complète, par exemple https://exemple.fr'
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
    ? true
    : 'L’adresse doit commencer par http:// ou https://'
}

/**
 * Réseau de prestataires (cahier des charges § 2.4) : annuaire en lecture
 * seule, alimenté par l'équipe éditoriale depuis l'admin.
 *
 * Pas de brouillons ici, contrairement aux articles et aux guides : une fiche
 * se prépare puis se valide, et la case « Visible sur le site » dit cela plus
 * clairement à l'équipe qu'un cycle brouillon/publication. L'accès public
 * s'appuie donc sur `published`, pas sur `_status`.
 */
export const Providers: CollectionConfig = {
  slug: 'providers',
  labels: {
    singular: 'Prestataire',
    plural: 'Prestataires',
  },
  admin: {
    group: 'Contenus',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'isSubscribed', 'published'],
    listSearchableFields: ['name', 'shortDescription'],
    description:
      'Annuaire des partenaires des élus. Une fiche n’apparaît sur le site qu’une fois cochée « Visible sur le site ».',
    components: {
      beforeListTable: ['@/components/admin/ProviderCategoryFilter#ProviderCategoryFilter'],
    },
  },
  access: {
    read: publishedFlagOrLoggedIn,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  hooks: {
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
          label: 'Informations',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Nom',
              required: true,
              maxLength: 100,
              admin: {
                description: '100 caractères maximum.',
              },
            },
            {
              name: 'logo',
              type: 'upload',
              label: 'Logo',
              relationTo: 'media',
              admin: {
                description:
                  'Facultatif : à défaut, l’annuaire affiche les initiales du prestataire.',
              },
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              label: 'Description courte',
              required: true,
              maxLength: 200,
              admin: {
                description:
                  'Une à deux phrases, affichées dans l’annuaire et en tête de la fiche. 200 caractères maximum.',
              },
            },
            {
              name: 'description',
              type: 'richText',
              label: 'Présentation',
              editor: profileEditor(),
              admin: {
                description: 'Facultatif : le détail de l’offre, affiché sur la fiche.',
              },
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
              relationTo: 'provider-categories',
              required: true,
              hasMany: false,
              admin: {
                description:
                  'Les catégories se gèrent dans Taxonomies › Catégories de prestataires.',
              },
            },
            {
              name: 'interventionAreas',
              type: 'select',
              label: 'Zone d’intervention',
              hasMany: true,
              options: [...interventionAreaOptions],
              admin: {
                description:
                  'Une ou plusieurs régions. « France entière » suffit pour un prestataire national : il remonte alors sur toutes les régions.',
              },
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'contact',
              type: 'group',
              label: 'Contact',
              admin: {
                description: 'Coordonnées publiées telles quelles sur la fiche.',
              },
              fields: [
                {
                  name: 'contactName',
                  type: 'text',
                  label: 'Nom du contact',
                  maxLength: 80,
                  admin: {
                    description:
                      'Facultatif : la personne à joindre chez le prestataire. 80 caractères maximum.',
                  },
                },
                {
                  name: 'email',
                  type: 'email',
                  label: 'Email',
                },
                {
                  name: 'phone',
                  type: 'text',
                  label: 'Téléphone',
                },
                {
                  name: 'website',
                  type: 'text',
                  label: 'Site web',
                  validate: validateWebsite,
                  admin: {
                    description: 'URL complète, avec https://',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    slugField('name'),
    {
      name: 'isSubscribed',
      type: 'checkbox',
      label: 'Prestataire abonné (Mise en avant)',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'Coché pour un prestataire abonné (payant). Sa fiche sera affichée en grand format dans la section « Prestataires abonnés » en tête de l’annuaire.',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      label: 'Visible sur le site',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'À cocher une fois la fiche relue et validée. Tant qu’elle est décochée, le prestataire n’apparaît pas dans l’annuaire public.',
      },
    },
  ],
}
