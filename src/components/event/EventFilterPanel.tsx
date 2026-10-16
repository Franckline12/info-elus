import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CheckIcon from '@mui/icons-material/Check'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import TuneIcon from '@mui/icons-material/Tune'

import AppLink from '@/components/AppLink'
import type { FilterItem } from '@/components/FilterLinks'
import { colors, radius, surfaceBorder } from '@/theme/tokens'

type Group = {
  label: string
  items: FilterItem[]
  /** Au-delà de ce nombre, les options restantes se replient sous « +N ». */
  maxVisible?: number
}

type Props = {
  groups: Group[]
}

const pillSx = (active: boolean) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  px: 1.5,
  py: 0.75,
  borderRadius: `${radius}px`,
  border: `1px solid ${active ? 'transparent' : surfaceBorder}`,
  fontSize: '0.8125rem',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  backgroundColor: active ? colors.blueBright : '#FFFFFF',
  color: active ? '#FFFFFF' : colors.textSecondary,
  '&:hover': active ? {} : { borderColor: colors.blueBright, color: colors.blueBright },
})

/** Une puce de filtre : coche pour l'option active, libellé + compteur sinon. */
function FilterPill({ item }: { item: FilterItem }) {
  return (
    <AppLink href={item.href} underline="none" aria-current={item.active ? 'page' : undefined} sx={pillSx(item.active)}>
      {item.active ? <CheckIcon aria-hidden sx={{ fontSize: '1.05em' }} /> : null}
      {item.label}
    </AppLink>
  )
}

/**
 * Un groupe de filtres (organisateurs, régions) : libellé, puis puces en
 * ligne. Au-delà de `maxVisible`, les options restantes se replient dans un
 * `<details>` natif — accessible et fonctionnel sans JavaScript, à la
 * différence d'un menu déroulant.
 */
function FilterGroup({ label, items, maxVisible = Infinity }: Group) {
  if (items.length === 0) return null

  const visible = items.slice(0, maxVisible)
  const rest = items.slice(maxVisible)

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        component="span"
        sx={{ display: 'block', mb: 1, fontSize: '0.8125rem', fontWeight: 700, color: colors.textSecondary }}
      >
        {label}
      </Typography>

      <Box
        component="ul"
        sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, listStyle: 'none', m: 0, p: 0 }}
      >
        {visible.map((item) => (
          <li key={item.key}>
            <FilterPill item={item} />
          </li>
        ))}

        {rest.length > 0 ? (
          <li>
            <Box
              component="details"
              sx={{
                '& > summary': {
                  ...pillSx(rest.some((item) => item.active)),
                  cursor: 'pointer',
                  listStyle: 'none',
                },
                '& > summary::-webkit-details-marker': { display: 'none' },
                '& > summary::marker': { content: '""' },
              }}
            >
              <Box component="summary">
                {`+${rest.length}`}
                <KeyboardArrowDownIcon aria-hidden sx={{ fontSize: '1.05em' }} />
              </Box>

              <Box
                component="ul"
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  listStyle: 'none',
                  m: 0,
                  mt: 1,
                  p: 0,
                }}
              >
                {rest.map((item) => (
                  <li key={item.key}>
                    <FilterPill item={item} />
                  </li>
                ))}
              </Box>
            </Box>
          </li>
        ) : null}
      </Box>
    </Box>
  )
}

/**
 * Bandeau de filtres de la page Salons (§ 8), sur le modèle de la maquette :
 * une carte unique, icône « Filtres », puis un groupe par famille de filtres
 * séparé par un filet vertical. Propre à cette page — `FilterLinks` reste la
 * version utilisée par l'annuaire des prestataires.
 */
export function EventFilterPanel({ groups }: Props) {
  const visibleGroups = groups.filter((group) => group.items.length > 1)
  if (visibleGroups.length === 0) return null

  return (
    <Box
      component="div"
      role="search"
      aria-label="Filtrer les salons"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: { xs: 2.5, md: 3 },
        p: { xs: 2, md: 2.5 },
        border: `1px solid ${surfaceBorder}`,
        borderRadius: `${radius}px`,
        backgroundColor: colors.paperRaised,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <TuneIcon aria-hidden sx={{ color: colors.blueBright }} />
        <Typography component="span" sx={{ fontWeight: 700 }}>
          Filtres
        </Typography>
      </Box>

      {visibleGroups.map((group, index) => (
        <Box key={group.label} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2.5, md: 3 }, minWidth: 0 }}>
          {index > 0 ? (
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
          ) : null}
          <FilterGroup {...group} />
        </Box>
      ))}
    </Box>
  )
}

export default EventFilterPanel
