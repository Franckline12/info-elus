import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  component?: 'h1' | 'h2' | 'span' | 'p'
}

/**
 * Contenu retiré de l'affichage mais lu par les technologies d'assistance.
 * Sert au titre de niveau 1 de l'accueil, dont l'équivalent visuel est le
 * logotype du masthead.
 */
export function VisuallyHidden({ children, component = 'span' }: Props) {
  return (
    <Box
      component={component}
      sx={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clipPath: 'inset(50%)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </Box>
  )
}

export default VisuallyHidden
