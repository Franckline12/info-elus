import Box from '@mui/material/Box'

import AppLink from '@/components/AppLink'
import { colors, radius, surfaceBorder } from '@/theme/tokens'

export type FilterItem = {
  key: string
  label: string
  href: string
  active: boolean
}

type Props = {
  items: FilterItem[]
  label: string
  /** `inline` : barre de filtres d'un listing. `stacked` : encart de colonne. */
  layout?: 'inline' | 'stacked'
}

const inlineStyles = (active: boolean) => ({
  display: 'inline-block',
  px: 1.5,
  py: 0.75,
  borderRadius: `${radius}px`,
  border: `1px solid ${active ? 'transparent' : surfaceBorder}`,
  fontSize: '0.875rem',
  fontWeight: 500,
  backgroundColor: active ? colors.blueBright : colors.paperRaised,
  color: active ? '#FFFFFF' : colors.textSecondary,
  '&:hover': active ? {} : { borderColor: colors.blueBright, color: colors.blueBright },
})

const stackedStyles = (active: boolean) => ({
  display: 'block',
  px: 1.25,
  py: 0.875,
  borderRadius: `${radius}px`,
  fontSize: '0.875rem',
  fontWeight: 500,
  backgroundColor: active ? colors.bluePale : 'transparent',
  color: active ? colors.blueMid : colors.textSecondary,
  '&:hover': active ? {} : { backgroundColor: colors.paper, color: colors.blueBright },
})

/**
 * Filtres rendus en liens : chaque état a son URL, donc un filtre partageable,
 * indexable et fonctionnel sans JavaScript — d'où le choix de liens plutôt que
 * du `Select` de la maquette.
 */
export function FilterLinks({ items, label, layout = 'inline' }: Props) {
  if (items.length <= 1) return null

  const styles = layout === 'inline' ? inlineStyles : stackedStyles

  return (
    <Box component="nav" aria-label={label}>
      <Box
        component="ul"
        sx={{
          display: 'flex',
          flexDirection: layout === 'inline' ? 'row' : 'column',
          flexWrap: layout === 'inline' ? 'wrap' : 'nowrap',
          gap: layout === 'inline' ? 1 : 0.25,
          listStyle: 'none',
          m: 0,
          p: 0,
        }}
      >
        {items.map((item) => (
          <li key={item.key}>
            <AppLink
              href={item.href}
              underline="none"
              aria-current={item.active ? 'page' : undefined}
              sx={styles(item.active)}
            >
              {item.label}
            </AppLink>
          </li>
        ))}
      </Box>
    </Box>
  )
}

export default FilterLinks
