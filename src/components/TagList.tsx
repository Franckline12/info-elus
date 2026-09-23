import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

import { colors, surfaceBorder } from '@/theme/tokens'

import AppLink from './AppLink'

export type TagListItem = {
  id: number | string
  name: string
  slug?: string | null
}

type Props = {
  tags: TagListItem[]
  /** Construit l'URL de chaque tag ; omis, les tags sont affichés sans lien. */
  hrefFor?: (tag: TagListItem) => string
  label?: string
  /** `filled` : fond bleu pâle du nuage de tags de la maquette. */
  variant?: 'outlined' | 'filled'
  /** Préfixe `#`, comme dans l'encart « Tags populaires ». */
  hash?: boolean
}

/**
 * Tags en rectangles très légèrement adoucis : la pilule arrondie de Material
 * est volontairement écartée (cahier des charges § 5.3).
 */
export function TagList({
  tags,
  hrefFor,
  label = 'Tags',
  variant = 'outlined',
  hash = false,
}: Props) {
  if (tags.length === 0) return null

  const chipStyles =
    variant === 'filled'
      ? { backgroundColor: colors.bluePale, color: colors.blueMid }
      : {
          backgroundColor: 'transparent',
          color: colors.textSecondary,
          border: `1px solid ${surfaceBorder}`,
        }

  return (
    <Box component="nav" aria-label={label}>
      <Box
        component="ul"
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, listStyle: 'none', m: 0, p: 0 }}
      >
        {tags.map((tag) => {
          const chip = (
            <Chip label={hash ? `#${tag.name}` : tag.name} size="small" sx={chipStyles} />
          )

          return (
            <li key={tag.id}>
              {hrefFor ? (
                <AppLink
                  href={hrefFor(tag)}
                  underline="none"
                  sx={{
                    display: 'inline-flex',
                    '&:hover .MuiChip-root': {
                      borderColor: colors.blueBright,
                      color: colors.blueBright,
                    },
                  }}
                >
                  {chip}
                </AppLink>
              ) : (
                chip
              )}
            </li>
          )
        })}
      </Box>
    </Box>
  )
}

export default TagList
