import Box from '@mui/material/Box'

import AppLink from '@/components/AppLink'
import type { ContentType } from '@/lib/routes'
import { listingPagePath } from '@/lib/routes'
import type { Category } from '@/payload-types'
import { rule } from '@/theme/tokens'

type Props = {
  type: ContentType
  categories: Category[]
  activeSlug?: string
}

const itemStyles = (active: boolean) => ({
  display: 'inline-block',
  px: 1.5,
  py: 0.75,
  border: `1px solid ${active ? 'transparent' : rule}`,
  fontSize: '0.875rem',
  fontWeight: 500,
  backgroundColor: active ? 'primary.main' : 'transparent',
  color: active ? 'primary.contrastText' : 'text.secondary',
  '&:hover': active ? {} : { borderColor: 'primary.main', color: 'primary.main' },
})

/**
 * Filtre par catégorie (§ 2.1). Ce sont de vrais liens vers `?categorie=slug` :
 * chaque état a son URL, et le filtre fonctionne sans JavaScript.
 */
export function CategoryFilter({ type, categories, activeSlug }: Props) {
  if (categories.length === 0) return null

  return (
    <Box component="nav" aria-label="Filtrer par catégorie" sx={{ mb: 4 }}>
      <Box
        component="ul"
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, listStyle: 'none', m: 0, p: 0 }}
      >
        <li>
          <AppLink
            href={listingPagePath(type)}
            underline="none"
            aria-current={activeSlug ? undefined : 'page'}
            sx={itemStyles(!activeSlug)}
          >
            Toutes
          </AppLink>
        </li>

        {categories.map((category) =>
          category.slug ? (
            <li key={category.id}>
              <AppLink
                href={listingPagePath(type, { categorySlug: category.slug })}
                underline="none"
                aria-current={activeSlug === category.slug ? 'page' : undefined}
                sx={itemStyles(activeSlug === category.slug)}
              >
                {category.name}
              </AppLink>
            </li>
          ) : null,
        )}
      </Box>
    </Box>
  )
}

export default CategoryFilter
