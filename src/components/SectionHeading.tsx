import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import AppLink from './AppLink'

import { rule } from '@/theme/tokens'

type Props = {
  title: string
  /** Lien « voir tout » optionnel, aligné à droite du titre. */
  href?: string
  linkLabel?: string
  component?: 'h1' | 'h2' | 'h3'
  id?: string
}

/**
 * Titre de section surmonté d'un filet épais et souligné d'un filet fin :
 * la signature typographique des rubriques d'un journal.
 */
export function SectionHeading({
  title,
  href,
  linkLabel = 'Voir tout',
  component = 'h2',
  id,
}: Props) {
  return (
    <Box sx={{ borderTop: `2px solid currentColor`, color: 'text.primary', mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 2,
          borderBottom: `1px solid ${rule}`,
          py: 1,
        }}
      >
        <Typography
          id={id}
          component={component}
          variant="h3"
          sx={{ letterSpacing: '0.01em', m: 0 }}
        >
          {title}
        </Typography>
        {href ? (
          <AppLink
            href={href}
            variant="body2"
            sx={{ color: 'primary.main', fontWeight: 500, flexShrink: 0 }}
          >
            {linkLabel}
          </AppLink>
        ) : null}
      </Box>
    </Box>
  )
}

export default SectionHeading
