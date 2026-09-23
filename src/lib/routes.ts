import type { Article } from '@/payload-types'

export type ContentType = Article['type']

/** Listing correspondant à un type de contenu (cahier des charges § 3). */
export const listingPath = (type: ContentType): string =>
  type === 'news' ? '/actualite' : '/articles'

export const listingLabel = (type: ContentType): string =>
  type === 'news' ? 'Actualité' : 'Articles'

/** Rubriques qui ne dépendent pas du champ `type` des articles. */
export const guidesPath = '/guides'
export const quizzesPath = '/jeux-quiz'
export const providersPath = '/prestataires'
export const searchPath = '/recherche'

export const guidePath = (guide: { slug?: string | null }): string =>
  `${guidesPath}/${guide.slug ?? ''}`

export const quizPath = (quiz: { slug?: string | null }): string =>
  `${quizzesPath}/${quiz.slug ?? ''}`

export const providerPath = (provider: { slug?: string | null }): string =>
  `${providersPath}/${provider.slug ?? ''}`

/** Listing des guides filtré sur un thème. */
export const themePath = (slug: string): string => `${guidesPath}?theme=${encodeURIComponent(slug)}`

/** Listing de l'annuaire filtré sur une catégorie de prestataire. */
export const providerCategoryPath = (value: string): string =>
  `${providersPath}?categorie=${encodeURIComponent(value)}`

/** URL publique d'un document, déterminée par son type. */
export const articlePath = (article: Pick<Article, 'type'> & { slug?: string | null }): string =>
  `${listingPath(article.type)}/${article.slug ?? ''}`

/** Lien vers le listing filtré sur une catégorie. */
export const categoryPath = (type: ContentType, slug: string): string =>
  `${listingPath(type)}?categorie=${encodeURIComponent(slug)}`

/** Lien vers le listing filtré sur un tag (§ 2.3 : taxonomie commune). */
export const tagPath = (type: ContentType, slug: string): string =>
  `${listingPath(type)}?tag=${encodeURIComponent(slug)}`

export type ListingFilters = {
  page?: number
  categorySlug?: string
  tagSlug?: string
}

/** Construit l'URL d'une page de listing en conservant les filtres actifs. */
export const listingPagePath = (
  type: ContentType,
  { page, categorySlug, tagSlug }: ListingFilters = {},
): string => {
  const params = new URLSearchParams()
  if (categorySlug) params.set('categorie', categorySlug)
  if (tagSlug) params.set('tag', tagSlug)
  if (page && page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${listingPath(type)}?${query}` : listingPath(type)
}
