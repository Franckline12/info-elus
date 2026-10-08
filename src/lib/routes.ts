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

/**
 * URL d'une page de listing, quel que soit le listing : les paramètres vides
 * sont omis, et la page 1 reste l'URL nue pour ne pas dédoubler l'adresse
 * canonique aux yeux des moteurs.
 */
export const pagePath = (
  basePath: string,
  page?: number,
  params: Record<string, string | undefined> = {},
): string => {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }
  if (page && page > 1) search.set('page', String(page))
  const query = search.toString()
  return query ? `${basePath}?${query}` : basePath
}

export type ProviderFilters = {
  page?: number
  categorySlug?: string
  /** Zone d'intervention, valeur de `interventionAreaOptions`. */
  area?: string
}

/**
 * URL de l'annuaire des prestataires : catégorie, zone et page voyagent
 * ensemble, pour que choisir un filtre n'efface pas l'autre (§ 2.4).
 */
export const providersPagePath = ({ page, categorySlug, area }: ProviderFilters = {}): string =>
  pagePath(providersPath, page, { categorie: categorySlug, zone: area })

/** Listing de l'annuaire filtré sur une seule catégorie. */
export const providerCategoryPath = (value: string): string =>
  providersPagePath({ categorySlug: value })

/** Construit l'URL d'une page de listing d'articles en conservant les filtres actifs. */
export const listingPagePath = (
  type: ContentType,
  { page, categorySlug, tagSlug }: ListingFilters = {},
): string => pagePath(listingPath(type), page, { categorie: categorySlug, tag: tagSlug })

/**
 * Numéro de page lu dans l'URL. Toute valeur absurde (`?page=0`, `?page=abc`)
 * ramène à la première page plutôt qu'à une erreur.
 */
export const parsePage = (value?: string): number => {
  const page = Number.parseInt(value ?? '1', 10)
  return Number.isNaN(page) || page < 1 ? 1 : page
}

/** Construit l'URL d'une page de l'historique des quiz (§ 2.5). */
export const quizzesPagePath = (page?: number): string => pagePath(quizzesPath, page)

/** Parcours de la lettre hebdomadaire (§ 2.6). */
export const newsletterConfirmationPath = (token: string): string =>
  `/newsletter/confirmation?token=${encodeURIComponent(token)}`

export const newsletterUnsubscribePath = (token: string): string =>
  `/newsletter/desinscription?token=${encodeURIComponent(token)}`
