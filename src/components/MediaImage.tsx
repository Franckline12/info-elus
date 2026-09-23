import Box from '@mui/material/Box'
import type { SxProps, Theme } from '@mui/material/styles'
import Image from 'next/image'

import type { Media } from '@/payload-types'

type Props = {
  media?: Media | number | null
  /** Attribut `sizes` de next/image : indispensable pour ne pas servir trop lourd. */
  sizes: string
  /** Rapport largeur/hauteur du cadre. `undefined` conserve les dimensions natives. */
  ratio?: number
  /** L'image remplit toute la hauteur de son parent (colonne d'un bandeau). */
  cover?: boolean
  priority?: boolean
  sx?: SxProps<Theme>
}

/**
 * Image issue de la collection Media. Rend `null` si la relation n'est pas
 * peuplée : `alt` est obligatoire côté CMS, on ne fabrique jamais d'alternative
 * textuelle vide (§ 4.5).
 */
export function MediaImage({ media, sizes, ratio, cover = false, priority = false, sx }: Props) {
  if (!media || typeof media !== 'object' || !media.url) return null

  if (!ratio && !cover) {
    return (
      <Image
        src={media.url}
        alt={media.alt}
        width={media.width ?? 1200}
        height={media.height ?? 800}
        sizes={sizes}
        priority={priority}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    )
  }

  return (
    <Box
      sx={[
        {
          position: 'relative',
          width: '100%',
          ...(cover ? { height: '100%' } : { aspectRatio: String(ratio) }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Image
        src={media.url}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectFit: 'cover' }}
      />
    </Box>
  )
}

export default MediaImage
