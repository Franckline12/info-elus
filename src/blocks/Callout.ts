import type { Block } from 'payload'
import {
  BoldFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

/**
 * Encadré éditorial inséré dans un corps de texte Lexical.
 * Partagé entre les articles et les guides.
 */
export const Callout: Block = {
  slug: 'callout',
  interfaceName: 'CalloutBlock',
  labels: {
    singular: 'Encadré',
    plural: 'Encadrés',
  },
  fields: [
    {
      name: 'variant',
      type: 'select',
      label: 'Type d’encadré',
      required: true,
      defaultValue: 'info',
      options: [
        { value: 'info', label: 'Bon à savoir' },
        { value: 'warning', label: 'Attention' },
        { value: 'keyPoint', label: 'À retenir' },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Contenu',
      required: true,
      // Mise en forme volontairement minimale : un encadré reste du texte court.
      editor: lexicalEditor({
        features: () => [
          ParagraphFeature(),
          BoldFeature(),
          ItalicFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
          LinkFeature({ enabledCollections: ['articles'] }),
          InlineToolbarFeature(),
        ],
      }),
    },
  ],
}
