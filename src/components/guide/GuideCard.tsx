import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'
import MediaImage from '@/components/MediaImage'
import { guidePath, themePath } from '@/lib/routes'
import { asTheme, themeColor } from '@/lib/themeColor'
import type { Guide } from '@/payload-types'
import { cardHoverSx, colors } from '@/theme/tokens'

type Props = {
  guide: Guide
  priority?: boolean
}

/**
 * Vignette de guide (maquette, rail « Guides CSE » et page listing) : image,
 * badge de thème, titre, temps de lecture. La couleur du thème est portée par le
 * badge seul — pas de filet vertical, pas de numérotation. Au survol, la carte
 * se détache par une élévation neutre plutôt que par une bordure bleue.
 */
export function GuideCard({ guide, priority = false }: Props) {
  const theme = asTheme(guide.theme)
  const href = guidePath(guide)
  const accent = themeColor(theme?.color)
  const sectionCount = guide.sections?.length ?? 0

  return (
    <Card
      component="article"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        ...cardHoverSx,
      }}
    >
      {guide.featuredImage ? (
        <AppLink href={href} tabIndex={-1} aria-hidden sx={{ display: 'block' }}>
          <MediaImage
            media={guide.featuredImage}
            ratio={16 / 9}
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 300px"
            priority={priority}
          />
        </AppLink>
      ) : null}

      <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {theme ? (
          <Box sx={{ mb: 1.25 }}>
            <AppLink
              href={theme.slug ? themePath(theme.slug) : href}
              underline="none"
              sx={{ display: 'inline-flex' }}
            >
              <Chip
                label={theme.name}
                size="small"
                sx={{ backgroundColor: colors.bluePale, color: accent, fontWeight: 500 }}
              />
            </AppLink>
          </Box>
        ) : null}

        <Typography variant="h4" component="h3" sx={{ fontSize: '1rem', mb: 1.25 }}>
          <AppLink href={href} underline="none" sx={{ color: 'text.primary' }}>
            {guide.title}
          </AppLink>
        </Typography>

        {sectionCount > 0 ? (
          <Typography
            component="p"
            sx={{
              mt: 'auto',
              pt: 0.5,
              fontSize: '0.8125rem',
              color: 'text.secondary',
              m: 0,
            }}
          >
            {sectionCount} section{sectionCount > 1 ? 's' : ''}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default GuideCard
