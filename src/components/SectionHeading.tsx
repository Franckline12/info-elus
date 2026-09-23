import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import AppLink from './AppLink'

type Props = {
  title: string
  /** Lien « voir tout » optionnel, aligné à droite du titre. */
  href?: string
  linkLabel?: string
  component?: 'h1' | 'h2' | 'h3'
  id?: string
}

/**
 * Titre de rubrique de la maquette : libellé en gras à gauche, lien de renvoi
 * vers le listing à droite. Les filets sont portés par les sections elles-mêmes.
 */
export function SectionHeading({
  title,
  href,
  linkLabel = 'Voir tout',
  component = 'h2',
  id,
}: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 2,
        mb: { xs: 2, md: 2.5 },
      }}
    >
      <Typography
        id={id}
        component={component}
        variant="h3"
        sx={{ fontSize: { xs: '1.25rem', md: '1.375rem' }, letterSpacing: '-0.01em', m: 0 }}
      >
        {title}
      </Typography>

      {href ? (
        <AppLink
          href={href}
          underline="hover"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            flexShrink: 0,
            color: 'primary.main',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {linkLabel}
          <ArrowForwardIcon aria-hidden sx={{ fontSize: '0.95em' }} />
        </AppLink>
      ) : null}
    </Box>
  )
}

export default SectionHeading
