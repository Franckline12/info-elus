import type { CollectionConfig, DateFieldValidation } from 'payload'

import { loggedIn, publishedFlagOrLoggedIn } from '../access'
import { eventEditor } from '../fields/contentEditor'
import { validateUrl } from '../fields/validateUrl'
import { formatEventSlugHook } from '../hooks/formatSlug'
import { byPublishedFlag, revalidateContent } from '../hooks/revalidateContent'
import { eventRegionOptions } from '../lib/interventionAreas'

const { afterChange, afterDelete } = revalidateContent('/salons', {
  isPublished: byPublishedFlag,
})

const validateEndDate: DateFieldValidation = (value, { siblingData }) => {
  if (!value) return 'La date de fin est requise.'

  const startDate = (siblingData as { startDate?: string | Date | null }).startDate
  if (startDate && new Date(value) < new Date(startDate)) {
    return 'La date de fin doit être postérieure ou égale à la date de début.'
  }

  return true
}

/**
 * Salons professionnels destinés aux élus de CSE (rubrique Salons, § 8 du
 * cahier des charges — calendrier d'événements limité aux salons, à
 * l'exclusion des webinaires et des congrès syndicaux).
 *
 * Saisie manuelle par l'équipe éditoriale, deux fois par an au rythme de
 * publication des organisateurs. Pas de brouillons, comme pour les
 * prestataires : la case « Visible sur le site » fait foi, pas `_status`.
 *
 * Particularité de cette collection : le classement à venir/passé ne dépend
 * d'aucune action éditoriale, seulement de la date du jour (voir
 * `src/lib/queries/events.ts` et la revalidation programmée des pages
 * publiques, qui compensent l'absence de publication déclenchante).
 */
export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Salon',
    plural: 'Salons',
  },
  defaultSort: 'startDate',
  admin: {
    group: 'Contenus',
    useAsTitle: 'title',
    defaultColumns: ['title', 'organizer', 'startDate', 'city', 'published'],
    listSearchableFields: ['title', 'city', 'venue'],
    description:
      'Salons professionnels pour élus de CSE. Triés par date de début croissante : les prochains salons en tête, pour que l’équipe voie immédiatement ce qui approche.',
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
              name: 'title',
              type: 'text',
              label: 'Titre',
              required: true,
              admin: {
                description: 'Le nom du salon, par exemple « Solutions CSE Paris ».',
              },
            },
            {
              name: 'organizer',
              type: 'relationship',
              label: 'Organisateur',
              relationTo: 'organizers',
              required: true,
              hasMany: false,
              index: true,
              admin: {
                description: 'Les organisateurs se gèrent dans Taxonomies › Organisateurs.',
              },
            },
            {
              name: 'description',
              type: 'richText',
              label: 'Description',
              editor: eventEditor(),
            },
            {
              name: 'featuredImage',
              type: 'upload',
              label: 'Image mise en avant',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Dates et lieu',
          fields: [
            {
              name: 'startDate',
              type: 'date',
              label: 'Date de début',
              required: true,
              index: true,
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                  displayFormat: 'd MMM yyyy',
                },
              },
            },
            {
              name: 'endDate',
              type: 'date',
              label: 'Date de fin',
              required: true,
              validate: validateEndDate,
              admin: {
                description: 'Pour un salon d’une seule journée, la même date que le début.',
                date: {
                  pickerAppearance: 'dayOnly',
                  displayFormat: 'd MMM yyyy',
                },
              },
            },
            {
              name: 'city',
              type: 'text',
              label: 'Ville',
              required: true,
            },
            {
              name: 'venue',
              type: 'text',
              label: 'Lieu',
              required: true,
              admin: {
                description: 'Le site qui accueille le salon, par exemple « Parc des Princes ».',
              },
            },
            {
              name: 'address',
              type: 'textarea',
              label: 'Adresse complète',
            },
            {
              name: 'region',
              type: 'select',
              label: 'Région',
              required: true,
              options: [...eventRegionOptions],
              admin: {
                description: 'Sert au filtre géographique de la page Salons.',
              },
            },
          ],
        },
        {
          label: 'Pratique',
          fields: [
            {
              name: 'registrationUrl',
              type: 'text',
              label: 'Lien d’inscription',
              validate: validateUrl,
              admin: {
                description: 'URL complète, avec https://',
              },
            },
            {
              name: 'isFree',
              type: 'checkbox',
              label: 'Accès gratuit',
              defaultValue: true,
            },
            {
              name: 'exhibitorCount',
              type: 'number',
              label: 'Nombre d’exposants',
              min: 0,
              admin: {
                description: 'Facultatif, indiqué par l’organisateur.',
              },
            },
            {
              name: 'hasConferences',
              type: 'checkbox',
              label: 'Programme de conférences',
              defaultValue: false,
            },
          ],
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'Généré automatiquement depuis le titre et l’année de la date de début (un même salon revient chaque année). Modifiable, il sera normalisé.',
      },
      hooks: {
        beforeValidate: [formatEventSlugHook],
      },
    },
    {
      name: 'lastVerifiedAt',
      type: 'date',
      label: 'Dates vérifiées le',
      admin: {
        position: 'sidebar',
        description:
          'À mettre à jour chaque fois que les dates et le lieu sont revérifiés auprès de l’organisateur. Une information de salon périmée est pire que pas d’information : sans vérification récente, mieux vaut dépublier.',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
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
          'À cocher une fois la fiche relue et validée. Tant qu’elle est décochée, le salon n’apparaît pas sur le site public.',
      },
    },
  ],
}
