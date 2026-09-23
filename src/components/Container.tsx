import MuiContainer from '@mui/material/Container'
import type { ContainerProps } from '@mui/material/Container'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** `narrow` borne la colonne de lecture ; les autres occupent les 90 %. */
  width?: 'narrow' | 'default' | 'wide'
} & Omit<ContainerProps, 'maxWidth' | 'children'>

/**
 * Gouttière horizontale unique du site : le contenu occupe 90 % de la largeur de
 * la page, centré, soit 5 % de marge de chaque côté. Toutes les pages passent
 * par ici pour que les filets et les colonnes restent alignés d'une section à
 * l'autre, masthead et pied de page compris.
 */
const WIDTHS: Record<NonNullable<Props['width']>, string> = {
  narrow: 'min(90%, 760px)',
  default: '90%',
  wide: '90%',
}

export function Container({ children, width = 'default', sx, ...rest }: Props) {
  return (
    <MuiContainer
      maxWidth={false}
      disableGutters
      sx={{ width: WIDTHS[width], mx: 'auto', ...sx }}
      {...rest}
    >
      {children}
    </MuiContainer>
  )
}

export default Container
