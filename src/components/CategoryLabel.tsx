import Chip from '@mui/material/Chip'

import { colors } from '@/theme/tokens'

import AppLink from './AppLink'

type Props = {
  name: string
  /** Absent : la catégorie s'affiche sans lien (page de listing déjà filtrée). */
  href?: string
}

/** Un seul traitement, bleu pâle : l'ocre ne sort pas de Jeux & Quiz (§ 5.3). */
const TONE = { backgroundColor: colors.bluePale, color: colors.blueMid } as const

/**
 * Badge de rubrique : rectangle très légèrement adouci sur fond pâle, jamais une
 * pilule Material. Sert aussi bien aux catégories qu'aux thèmes de guide.
 */
export function CategoryLabel({ name, href }: Props) {
  const chip = <Chip label={name} size="small" sx={TONE} />

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
