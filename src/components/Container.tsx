import MuiContainer from '@mui/material/Container'
import type { ContainerProps } from '@mui/material/Container'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** `narrow` pour les colonnes de lecture, `wide` pour les grilles éditoriales. */
  width?: 'narrow' | 'default' | 'wide'
} & Omit<ContainerProps, 'maxWidth' | 'children'>

const MAX_WIDTH: Record<NonNullable<Props['width']>, ContainerProps['maxWidth']> = {
  narrow: 'md',
  default: 'lg',
  wide: 'xl',
}

/**
 * Gouttière horizontale unique du site : toutes les pages passent par ici pour
 * que les filets et les colonnes restent alignés d'une section à l'autre.
 */
export function Container({ children, width = 'default', sx, ...rest }: Props) {
  return (
    <MuiContainer maxWidth={MAX_WIDTH[width]} sx={{ px: { xs: 2, sm: 3, md: 4 }, ...sx }} {...rest}>
      {children}
    </MuiContainer>
  )
}

export default Container
