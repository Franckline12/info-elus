import type { CollectionBeforeValidateHook } from 'payload'
import { ValidationError } from 'payload'

export const MAX_MEDIA_FILE_SIZE = 2 * 1024 * 1024

/**
 * Rejette un fichier trop lourd avant le redimensionnement des `imageSizes` :
 * `generateFileData` a déjà renseigné `data.filesize` à ce stade (hook
 * `beforeValidate`), et aucun fichier n'est encore écrit sur disque (l'écriture
 * n'a lieu qu'après les hooks `beforeChange`).
 */
export const validateMediaFileSize: CollectionBeforeValidateHook = ({ data, req }) => {
  if (typeof data?.filesize === 'number' && data.filesize > MAX_MEDIA_FILE_SIZE) {
    throw new ValidationError({
      errors: [
        {
          message: 'Image trop lourde : 2 Mo maximum. Compressez l’image avant de la téléverser.',
          path: 'file',
        },
      ],
      req,
    })
  }

  return data
}
