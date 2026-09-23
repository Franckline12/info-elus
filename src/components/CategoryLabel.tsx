import Typography from '@mui/material/Typography'

import AppLink from './AppLink'

type Props = {
  name: string
  /** Absent : la catégorie s'affiche sans lien (page de listing déjà filtrée). */
  href?: string
}

const styles = {
  display: 'inline-block',
  fontSize: '0.75rem',
  fontWeight: 500,
  lineHeight: 1.3,
  letterSpacing: '0.09em',
  textTransform: 'uppercase' as const,
  color: 'primary.main',
}

/** Surtitre de rubrique : capitales espacées, pas de pastille arrondie. */
export function CategoryLabel({ name, href }: Props) {
  if (!href) {
    return (
      <Typography component="span" sx={styles}>
        {name}
      </Typography>
    )
  }

  return (
    <AppLink href={href} sx={styles}>
      {name}
    </AppLink>
  )
}

export default CategoryLabel
