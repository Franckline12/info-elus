import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import MoneyOffOutlinedIcon from '@mui/icons-material/MoneyOffOutlined'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'

import type { Event } from '@/payload-types'
import { colors, radius, surfaceBorder } from '@/theme/tokens'

type Props = {
  event: Pick<Event, 'isFree' | 'exhibitorCount' | 'hasConferences'>
  id?: string
}

/** Informations pratiques d'une fiche salon (§ 8), sur le modèle de `ProviderContact`. */
export function EventPracticalInfo({ event, id }: Props) {
  const items = [
    {
      Icon: event.isFree ? MoneyOffOutlinedIcon : PaidOutlinedIcon,
      label: event.isFree ? 'Accès gratuit' : 'Accès payant',
    },
    ...(typeof event.exhibitorCount === 'number'
      ? [{ Icon: GroupsOutlinedIcon, label: `${event.exhibitorCount} exposants` }]
      : []),
    ...(event.hasConferences
      ? [{ Icon: ForumOutlinedIcon, label: 'Programme de conférences' }]
      : []),
  ]

  return (
    <Box
      component="section"
      aria-labelledby={id}
      sx={{
        border: `1px solid ${surfaceBorder}`,
        borderRadius: `${radius}px`,
        backgroundColor: colors.paperRaised,
        px: { xs: 2, md: 2.5 },
        py: { xs: 1.5, md: 2 },
      }}
    >
      <Typography id={id} component="h2" sx={{ fontSize: '0.9375rem', fontWeight: 700, mb: 1 }}>
        Informations pratiques
      </Typography>

      <Box component="ul" sx={{ display: 'grid', gap: 1, m: 0, p: 0, listStyle: 'none' }}>
        {items.map(({ Icon, label }) => (
          <Box
            component="li"
            key={label}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.9375rem' }}
          >
            <Icon aria-hidden sx={{ fontSize: '1.125rem', color: colors.blueMid }} />
            {label}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default EventPracticalInfo
