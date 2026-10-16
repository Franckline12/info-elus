import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

import AppLink from '@/components/AppLink'
import { eventsPath } from '@/lib/routes'
import { colors, radius } from '@/theme/tokens'

/**
 * Bandeau d'une fiche salon dont la dernière journée est passée (§ 8). La
 * fiche n'est pas masquée pour autant : elle garde une valeur de référence et
 * de référencement, le bandeau se contente de situer l'édition dans le temps.
 */
export function EventPastNotice() {
  return (
    <Box
      role="status"
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.25,
        backgroundColor: colors.bluePale,
        color: colors.blueMid,
        borderRadius: `${radius}px`,
        px: { xs: 2, md: 2.5 },
        py: { xs: 1.5, md: 2 },
        mb: { xs: 2.5, md: 3 },
      }}
    >
      <InfoOutlinedIcon aria-hidden sx={{ fontSize: '1.25rem', mt: '0.1em', flexShrink: 0 }} />
      <Typography component="p" sx={{ m: 0, fontSize: '0.9375rem' }}>
        Cette édition est terminée.{' '}
        <AppLink href={eventsPath} sx={{ color: 'inherit', fontWeight: 600 }}>
          Voir les prochains salons →
        </AppLink>
      </Typography>
    </Box>
  )
}

export default EventPastNotice
