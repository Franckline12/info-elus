import FilterLinks from '@/components/FilterLinks'
import type { FilterItem } from '@/components/FilterLinks'
import type { ContentType } from '@/lib/routes'
import { listingPagePath } from '@/lib/routes'
import type { Category } from '@/payload-types'

type Props = {
  type: ContentType
  categories: Category[]
  activeSlug?: string
  layout?: 'inline' | 'stacked'
}

/** Filtre par catégorie d'un listing d'articles ou d'actualité (§ 2.1). */
export function CategoryFilter({ type, categories, activeSlug, layout = 'inline' }: Props) {
  const items: FilterItem[] = [
    {
      key: 'all',
      label: 'Toutes les catégories',
      href: listingPagePath(type),
      active: !activeSlug,
    },
    ...categories.map((category) => ({
      key: String(category.id),
      label: category.name,
      href: listingPagePath(type, { categorySlug: category.slug ?? undefined }),
      active: Boolean(category.slug) && category.slug === activeSlug,
    })),
  ]

  return <FilterLinks items={items} label="Filtrer par catégorie" layout={layout} />
}

export default CategoryFilter
