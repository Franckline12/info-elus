import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '../access'
import { slugField } from '../fields/slug'

/**
 * Métiers de l'annuaire des prestataires (§ 2.4) : « Formation »,
 * « Assistance juridique », « Billetterie & ASC »…
 *
 * Taxonomie distincte des catégories d'articles, qui classent un sujet et non
 * un métier : les réunir ferait apparaître « Billetterie & ASC » dans les
 * filtres des listings d'articles, et « Négociation » dans ceux de l'annuaire.
 *
 * Le slug voyage dans l'URL de l'annuaire (`/prestataires?categorie=...`) : le
 * renommer casse les liens déjà partagés, alors que modifier le nom affiché est
 * sans conséquence. Supprimer une catégorie encore utilisée laisse ses fiches
 * sans classement — elles restent en ligne, sans badge ni filtre — donc on
 * réaffecte avant de supprimer.
 */
export const ProviderCategories: CollectionConfig = {
  slug: 'provider-categories',
  labels: {
    singular: 'Catégorie de prestataire',
    plural: 'Catégories de prestataires',
  },
  admin: {
    group: 'Taxonomies',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    description:
      'Les métiers de l’annuaire. Ils alimentent le champ « Catégorie » des fiches prestataire et les filtres de la page Prestataires, par ordre alphabétique.',
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
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description:
          'Facultatif, à usage interne : précise ce que la catégorie couvre. N’apparaît pas sur le site.',
      },
    },
  ],
}
