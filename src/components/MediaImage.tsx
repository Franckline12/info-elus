import Box from '@mui/material/Box'
import Image from 'next/image'

import type { Media } from '@/payload-types'

type Props = {
  media?: Media | number | null
  /** Attribut `sizes` de next/image : indispensable pour ne pas servir trop lourd. */
  sizes: string
  /** Rapport largeur/hauteur du cadre. `undefined` conserve les dimensions natives. */
  ratio?: number
  priority?: boolean
}

/**
 * Image issue de la collection Media. Rend `null` si la relation n'est pas
 * peuplée : `alt` est obligatoire côté CMS, on ne fabrique jamais d'alternative
 * textuelle vide (§ 4.5).
 */
export function MediaImage({ media, sizes, ratio, priority = false }: Props) {
  if (!media || typeof media !== 'object' || !media.url) return null

  if (!ratio) {
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
    <Box sx={{ position: 'relative', width: '100%', aspectRatio: String(ratio) }}>
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
