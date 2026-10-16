import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'

import AppLink from '@/components/AppLink'
import { formatDateRange } from '@/lib/formatDate'
import { eventOrganizer } from '@/lib/organizers'
import { eventPath } from '@/lib/routes'
import type { Event } from '@/payload-types'
import { colors, rule } from '@/theme/tokens'

type Props = {
  event: Event
}

/**
 * Encart discret de l'accueil : le prochain salon à venir, en une ligne entre
 * deux filets. Pas de visuel, pas de grille — la rubrique Salons reste
 * secondaire sur cette page (§ 8 : « ne surcharge pas la page »).
 */
export function NextEventStrip({ event }: Props) {
  const organizer = eventOrganizer(event.organizer)

  return (
    <Box
      component="section"
      aria-labelledby="prochain-salon"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        columnGap: 1.5,
        rowGap: 0.5,
        py: 1.5,
        borderTop: `1px solid ${rule}`,
        borderBottom: `1px solid ${rule}`,
        fontSize: '0.9375rem',
      }}
    >
      <Typography
        id="prochain-salon"
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          fontWeight: 600,
          color: colors.blueMid,
        }}
      >
        <EventOutlinedIcon aria-hidden sx={{ fontSize: '1.125rem' }} />
        Prochain salon
      </Typography>

      <Typography component="span" sx={{ color: 'text.secondary' }}>
        {event.title}
        {organizer ? ` (${organizer.name})` : ''} — {formatDateRange(event.startDate, event.endDate)}
        {' — '}
        {event.city}
      </Typography>

      <AppLink
        href={eventPath(event)}
        underline="hover"
        sx={{ ml: 'auto', fontWeight: 500, color: colors.blueBright, flexShrink: 0 }}
      >
        Voir le salon →
      </AppLink>
    </Box>
  )
}

export default NextEventStrip
