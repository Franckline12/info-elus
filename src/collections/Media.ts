import type { CollectionConfig } from 'payload'

import { validateMediaFileSize } from '../hooks/validateMediaFileSize'

/**
 * Qualité de compression raisonnable pour les tailles générées. Le fichier
 * original conserve son format d'upload ; seules les variantes ci-dessous
 * sortent en WebP.
 */
const generatedFormat = { format: 'webp' as const, options: { quality: 75 } }

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [validateMediaFileSize],
  },
  upload: {
    // image/* pour les illustrations, application/pdf pour les ressources
    // téléchargeables des guides (modèles, PV type) qui partagent cette
    // collection.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'],
    adminThumbnail: 'thumbnail',
    // thumbnail (vignette de listing, 4:3), card (format carte, 16:9),
    // large (grand format, hero) et og (aperçu social, 1200×630 imposé).
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
        formatOptions: generatedFormat,
      },
      {
        name: 'card',
        width: 768,
        height: 432,
        position: 'centre',
        formatOptions: generatedFormat,
      },
      {
        name: 'large',
        width: 1600,
        formatOptions: generatedFormat,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        formatOptions: generatedFormat,
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texte alternatif',
      required: true,
      maxLength: 150,
      admin: {
        description:
          'Décrit l’image pour les lecteurs d’écran et les moteurs de recherche. 150 caractères maximum.',
      },
    },
  ],
}
