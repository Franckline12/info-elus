import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '../access'
import { slugField } from '../fields/slug'
import { validateUrl } from '../fields/validateUrl'

/**
 * Organisateurs de salons CSE (rubrique Salons, § 8 du cahier des charges).
 *
 * Taxonomie et non un simple champ texte sur la collection Events : il n'y a
 * que deux ou trois organisateurs, ils reviennent sur chaque édition d'une
 * année à l'autre, et deux salons portant le nom d'une même ville peuvent être
 * organisés par des structures différentes — le filtre par organisateur lève
 * cette ambiguïté (ex. « Le Salon CSE Rennes » d'Eluceo et « Solutions CSE
 * Rennes » de Comexposium, la même année).
 */
export const Organizers: CollectionConfig = {
  slug: 'organizers',
  labels: {
    singular: 'Organisateur',
    plural: 'Organisateurs',
  },
  admin: {
    group: 'Taxonomies',
    useAsTitle: 'name',
    defaultColumns: ['name', 'website', 'updatedAt'],
    description:
      'Les organisateurs de salons CSE. Alimentent le champ « Organisateur » des salons et le filtre de la page Salons.',
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
      name: 'website',
      type: 'text',
      label: 'Site web',
      validate: validateUrl,
      admin: {
        description: 'URL complète, avec https://',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Facultatif, à usage interne : n’apparaît pas sur le site.',
      },
    },
  ],
}
