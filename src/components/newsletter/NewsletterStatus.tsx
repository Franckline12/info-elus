import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

import Container from '@/components/Container'
import { colors, radius, surfaceBorder } from '@/theme/tokens'

export type StatusTone = 'success' | 'neutral' | 'warning'

type Props = {
  title: string
  /** Icône de rubrique, déjà dimensionnée par l'appelant. */
  icon: ReactNode
  tone?: StatusTone
  children: ReactNode
}

/**
 * Gabarit des deux pages transactionnelles de la lettre (confirmation et
 * désinscription) : un seul message, centré, sans distraction.
 *
 * Le ton n'est porté que par la couleur de l'icône et du filet : l'ocre reste
 * un signal, jamais un aplat, et aucune de ces pages n'a d'ombre (§ 5.3).
 */
export function NewsletterStatus({ title, icon, tone = 'neutral', children }: Props) {
  const accent =
    tone === 'success' ? colors.blueBright : tone === 'warning' ? colors.accentQuiz : colors.blueMid

  return (
    <Container sx={{ py: { xs: 5, md: 8 } }}>
      <Box
        sx={{
          maxWidth: 640,
          mx: 'auto',
          px: { xs: 2.5, sm: 4 },
          py: { xs: 3.5, md: 4.5 },
          backgroundColor: colors.paperRaised,
          border: `1px solid ${surfaceBorder}`,
          borderTop: `3px solid ${accent}`,
          borderRadius: `${radius}px`,
        }}
      >
        <Box sx={{ color: accent, display: 'flex', mb: 1.5 }}>{icon}</Box>

        <Typography
          variant="h1"
          component="h1"
          sx={{ fontSize: 'clamp(1.5rem, 1.2rem + 1.2vw, 2rem)', mb: 2 }}
        >
          {title}
        </Typography>

        {children}
      </Box>
    </Container>
  )
}

export default NewsletterStatus
