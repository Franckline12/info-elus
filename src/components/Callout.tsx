import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import type { CalloutBlock } from '@/payload-types'
import { colors, fonts } from '@/theme/tokens'

/**
 * Chaque variante porte un **titre textuel** : l'information ne repose jamais
 * sur la seule couleur (§ 4.5). Le composant `Alert` de MUI est écarté — arrondi,
 * coloré et iconographié à la manière Material.
 */
const VARIANTS = {
  info: {
    title: 'Bon à savoir',
    accent: colors.blueBright,
    background: colors.bluePale,
    borderWidth: 3,
  },
  warning: {
    title: 'Attention',
    accent: colors.blueDeep,
    background: colors.paperRaised,
    borderWidth: 5,
  },
  keyPoint: {
    title: 'À retenir',
    accent: colors.blueMid,
    background: colors.paperRaised,
    borderWidth: 3,
  },
} as const satisfies Record<CalloutBlock['variant'], unknown>

type Props = {
  variant: CalloutBlock['variant']
  children: React.ReactNode
}

export function Callout({ variant, children }: Props) {
  const { title, accent, background, borderWidth } = VARIANTS[variant]

  return (
    <Box
      component="aside"
      aria-label={title}
      sx={{
        my: 4,
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 2.5 },
        backgroundColor: background,
        borderLeft: `${borderWidth}px solid ${accent}`,
        borderTop: `1px solid ${colors.bluePale}`,
        borderRight: `1px solid ${colors.bluePale}`,
        borderBottom: `1px solid ${colors.bluePale}`,
        borderRadius: 0,
      }}
    >
      <Typography
        component="p"
        sx={{
          m: 0,
          mb: 1,
          fontFamily: fonts.sans,
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
          color: accent,
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          '& p': { margin: 0, fontSize: '1rem', lineHeight: 1.65 },
          '& p + p': { marginTop: '0.75em' },
          '& ul, & ol': { margin: '0.5em 0', paddingLeft: '1.25em' },
          '& li + li': { marginTop: '0.25em' },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Callout
