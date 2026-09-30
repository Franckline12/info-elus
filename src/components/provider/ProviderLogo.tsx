import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import MediaImage from '@/components/MediaImage'
import type { Provider } from '@/payload-types'
import { colors, surfaceBorder } from '@/theme/tokens'

type Props = {
  provider: Pick<Provider, 'name' | 'logo'>
  /** Côté du cadre, en pixels. */
  size?: number
}

/**
 * Initiales d'un prestataire : deux lettres au plus, prises sur les premiers
 * mots significatifs du nom (« Cabinet Vergne & Loiseau » → CV).
 */
const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter((word) => /\p{L}/u.test(word[0] ?? ''))
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')

/**
 * Vignette d'un prestataire : son logo, ou ses initiales à défaut. Le logo est
 * facultatif côté CMS, et l'annuaire doit rester lisible sans lui.
 *
 * Purement décoratif : le nom du prestataire est toujours écrit à côté, donc
 * les initiales sont masquées aux lecteurs d'écran plutôt que répétées.
 */
export function ProviderLogo({ provider, size = 72 }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: size,
        height: size,
        border: `1px solid ${surfaceBorder}`,
        backgroundColor: colors.paperRaised,
        // Le logo respire dans son cadre : `fill` se cale sur la boîte de
        // remplissage, la marge doit donc être portée par le cadre lui-même.
        p: 0.75,
        overflow: 'hidden',
      }}
    >
      {provider.logo ? (
        <MediaImage media={provider.logo} sizes={`${size}px`} ratio={1} fit="contain" />
      ) : (
        <Typography
          aria-hidden
          component="span"
          sx={{
            fontSize: size * 0.32,
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: colors.blueMid,
          }}
        >
          {initials(provider.name)}
        </Typography>
      )}
    </Box>
  )
}

export default ProviderLogo
