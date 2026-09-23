import type { Article } from '@/payload-types'

export type ContentType = Article['type']

/** Listing correspondant à un type de contenu (cahier des charges § 3). */
export const listingPath = (type: ContentType): string =>
  type === 'news' ? '/actualite' : '/articles'

export const listingLabel = (type: ContentType): string =>
  type === 'news' ? 'Actualité' : 'Articles'

/** URL publique d'un document, déterminée par son type. */
export const articlePath = (article: Pick<Article, 'type'> & { slug?: string | null }): string =>
  `${listingPath(article.type)}/${article.slug ?? ''}`

/** Lien vers le listing filtré sur une catégorie. */
export const categoryPath = (type: ContentType, slug: string): string =>
  `${listingPath(type)}?categorie=${encodeURIComponent(slug)}`

/** Construit l'URL d'une page de listing en conservant le filtre actif. */
export const listingPagePath = (
  type: ContentType,
  { page, categorySlug }: { page?: number; categorySlug?: string } = {},
): string => {
  const params = new URLSearchParams()
  if (categorySlug) params.set('categorie', categorySlug)
  if (page && page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${listingPath(type)}?${query}` : listingPath(type)
}
