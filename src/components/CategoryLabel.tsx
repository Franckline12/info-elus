import Chip from '@mui/material/Chip'

import { colors } from '@/theme/tokens'

import AppLink from './AppLink'

type Props = {
  name: string
  /** Absent : la catégorie s'affiche sans lien (page de listing déjà filtrée). */
  href?: string
  /**
   * `blue` (défaut) pour les vignettes et les listes ; `sand` pour l'en-tête
   * d'un contenu, comme sur la maquette de la page article.
   */
  tone?: 'blue' | 'sand'
}

const TONES = {
  blue: { backgroundColor: colors.bluePale, color: colors.blueMid },
  sand: { backgroundColor: colors.sandPale, color: colors.ink },
} as const

/**
 * Badge de rubrique : rectangle très légèrement adouci sur fond pâle, jamais une
 * pilule Material. Sert aussi bien aux catégories qu'aux thèmes de guide.
 */
export function CategoryLabel({ name, href, tone = 'blue' }: Props) {
  const chip = <Chip label={name} size="small" sx={TONES[tone]} />

  if (!href) return chip

  return (
    <AppLink
      href={href}
      underline="none"
      sx={{
        display: 'inline-flex',
        '&:hover .MuiChip-root': { backgroundColor: colors.blueBright, color: '#FFFFFF' },
      }}
    >
      {chip}
    </AppLink>
  )
}

export default CategoryLabel
