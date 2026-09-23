import type { CollectionConfig } from 'payload'

import { loggedIn, publishedOrLoggedIn } from '../access'
import { providerCategoryOptions } from '../lib/providerCategories'
import { slugField } from '../fields/slug'
import { populatePublishedAt } from '../hooks/populatePublishedAt'
import { revalidateContent } from '../hooks/revalidateContent'

const { afterChange, afterDelete } = revalidateContent('/prestataires')

/** Annuaire des partenaires des élus (§ 2.4). */
export const Providers: CollectionConfig = {
  slug: 'providers',
  labels: {
    singular: 'Prestataire',
    plural: 'Prestataires',
  },
  admin: {
    group: 'Contenus',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'area', '_status'],
    listSearchableFields: ['name', 'description'],
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
      name: 'name',
      type: 'text',
      label: 'Nom',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      label: 'Logo',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      required: true,
      maxLength: 400,
    },
    {
      name: 'category',
      type: 'select',
      label: 'Catégorie',
      required: true,
      index: true,
      options: [...providerCategoryOptions],
    },
    {
      name: 'area',
      type: 'text',
      label: 'Zone d’intervention',
      admin: {
        description: 'Par exemple « Île-de-France » ou « France entière ».',
      },
    },
    {
      name: 'website',
      type: 'text',
      label: 'Site web',
      admin: {
        description: 'URL complète, avec https://',
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email de contact',
    },
    slugField('name'),
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Date de référencement',
      index: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy HH:mm' },
      },
    },
  ],
}
