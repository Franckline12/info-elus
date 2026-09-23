import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import AppLink from './AppLink'

import { rule } from '@/theme/tokens'

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
}

/**
 * Tags en rectangles à bordure fine : le style « Chip » arrondi de Material
 * est volontairement écarté (cahier des charges § 5.3).
 */
export function TagList({ tags, hrefFor, label = 'Tags' }: Props) {
  if (tags.length === 0) return null

  return (
    <Box component="nav" aria-label={label}>
      <Box
        component="ul"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          listStyle: 'none',
          m: 0,
          p: 0,
        }}
      >
        {tags.map((tag) => {
          const content = (
            <Typography
              component="span"
              sx={{
                display: 'inline-block',
                px: 1.25,
                py: 0.5,
                border: `1px solid ${rule}`,
                fontSize: '0.8125rem',
                lineHeight: 1.4,
                color: 'text.secondary',
              }}
            >
              {tag.name}
            </Typography>
          )

          return (
            <li key={tag.id}>
              {hrefFor ? (
                <AppLink
                  href={hrefFor(tag)}
                  underline="none"
                  sx={{
                    display: 'inline-block',
                    '&:hover span': { borderColor: 'primary.main', color: 'primary.main' },
                  }}
                >
                  {content}
                </AppLink>
              ) : (
                content
              )}
            </li>
          )
        })}
      </Box>
    </Box>
  )
}

export default TagList
