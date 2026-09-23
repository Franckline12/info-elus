'use client'

/**
 * Rail horizontal des guides (maquette, accueil). Composant client pour une
 * seule raison : les deux flèches font défiler le conteneur. Sans JavaScript, le
 * rail reste défilable au doigt, au clavier et à la molette — les flèches sont
 * un confort, pas le seul moyen d'accès.
 */

import { useCallback, useRef } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import type { ReactNode } from 'react'

import { colors, rule } from '@/theme/tokens'

type Props = {
  children: ReactNode
  label: string
}

const arrowStyles = {
  position: 'absolute' as const,
  top: '38%',
  zIndex: 1,
  display: { xs: 'none', md: 'inline-flex' },
  width: 34,
  height: 34,
  backgroundColor: colors.paperRaised,
  border: `1px solid ${rule}`,
  borderRadius: '50%',
  color: 'text.primary',
  '&:hover': { backgroundColor: colors.bluePale },
}

export function GuideRail({ children, label }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollBy = useCallback((direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' })
  }, [])

  return (
    <Box sx={{ position: 'relative' }}>
      <IconButton
        onClick={() => scrollBy(-1)}
        aria-label="Faire défiler vers la gauche"
        sx={{ ...arrowStyles, left: { md: -17 } }}
      >
        <ChevronLeftIcon fontSize="small" />
      </IconButton>

      <Box
        ref={trackRef}
        role="group"
        aria-label={label}
        sx={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: {
            xs: 'minmax(230px, 80%)',
            sm: 'minmax(230px, 45%)',
            md: 'minmax(220px, calc(25% - 18px))',
          },
          gap: { xs: 2, md: 3 },
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          '& > *': { scrollSnapAlign: 'start' },
          pb: 0.5,
        }}
      >
        {children}
      </Box>

      <IconButton
        onClick={() => scrollBy(1)}
        aria-label="Faire défiler vers la droite"
        sx={{ ...arrowStyles, right: { md: -17 } }}
      >
        <ChevronRightIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}

export default GuideRail
