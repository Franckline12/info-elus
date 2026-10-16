import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import VisuallyHidden from '@/components/VisuallyHidden'
import { formatDateRange, formatEventBadge } from '@/lib/formatDate'
import { colors, radius, rule } from '@/theme/tokens'

type Props = {
  startDate?: string | null
  endDate?: string | null
}

/**
 * Vignette de date, pensée pour être l'information qu'on lit en premier dans
 * une ligne de salon (§ 8 : « dates mises en avant, c'est l'information
 * principale ici, pas le titre »).
 *
 * Les chiffres sont décoratifs (`aria-hidden`) : la date complète est portée
 * par un texte masqué visuellement, sur le modèle de `ProviderContact`.
 */
export function EventDateBadge({ startDate, endDate }: Props) {
  const parts = formatEventBadge(startDate, endDate)
  if (!parts) return null

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 72,
        minHeight: 72,
        px: 1,
        py: 1,
        border: `1px solid ${rule}`,
        borderRadius: `${radius}px`,
        backgroundColor: colors.bluePale,
        color: colors.blueMid,
        textAlign: 'center',
        flexShrink: 0,
      }}
    >
      <Box aria-hidden>
        <Typography component="span" sx={{ display: 'block', fontSize: '1.0625rem', fontWeight: 700, lineHeight: 1.1 }}>
          {parts.days}
        </Typography>
        <Typography component="span" sx={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.04em' }}>
          {parts.month}
        </Typography>
        <Typography component="span" sx={{ display: 'block', fontSize: '0.625rem', opacity: 0.8 }}>
          {parts.year}
        </Typography>
      </Box>
      <VisuallyHidden>{formatDateRange(startDate, endDate)}</VisuallyHidden>
    </Box>
  )
}

export default EventDateBadge
