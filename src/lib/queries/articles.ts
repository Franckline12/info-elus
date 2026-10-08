import type { PaginatedDocs, Where } from 'payload'

import type { FacetCounts } from '@/lib/filterOptions'
import type { Article } from '@/payload-types'
import type { ContentType } from '@/lib/routes'

import { getCategories } from './categories'
import { getPayloadClient } from './payload'

/**
 * Lectures publiques de la collection Articles.
 *
 * ATTENTION : la Local API ignore les droits d'accès par défaut
 * (`overrideAccess: true`). Chaque requête ci-dessous filtre donc explicitement
 * `_status = published` : aucun brouillon ne peut atteindre le site.
 */

const PUBLISHED: Where = { _status: { equals: 'published' } }

/** Population minimale : catégorie, tags et image mise en avant. */
const LIST_DEPTH = 1

/**
 * Le corps Lexical contient des uploads et des liens internes qui doivent être
 * peuplés à leur tour : un niveau de plus que pour les listes.
 */
const DETAIL_DEPTH = 2

const SORT_BY_DATE = '-publishedAt'

const publishedWhere = (...clauses: Where[]): Where => ({ and: [PUBLISHED, ...clauses] })

const ofType = (type: ContentType): Where => ({ type: { equals: type } })

const relationId = (value: number | { id: number } | null | undefined): number | null => {
  if (value === null || value === undefined) return null
  return typeof value === 'number' ? value : value.id
}

export type GetArticlesArgs = {
  type: ContentType
  categorySlug?: string
  tagSlug?: string
  /** Recherche plein texte sur le titre et le chapô (§ 2.1). */
  search?: string
  page?: number
  limit?: number
  /** Ids à écarter (l'actualité en grand format déjà affichée, par exemple). */
  excludeIds?: number[]
}

/** Liste paginée, triée par date de publication décroissante. */
export async function getArticles({
  type,
  categorySlug,
  tagSlug,
  search,
  page = 1,
  limit = 10,
  excludeIds = [],
}: GetArticlesArgs): Promise<PaginatedDocs<Article>> {
  const payload = await getPayloadClient()

  const clauses: Where[] = [ofType(type)]
  if (categorySlug) clauses.push({ 'category.slug': { equals: categorySlug } })
  if (tagSlug) clauses.push({ 'tags.slug': { equals: tagSlug } })
  if (search) clauses.push({ or: [{ title: { like: search } }, { excerpt: { like: search } }] })
  if (excludeIds.length > 0) clauses.push({ id: { not_in: excludeIds } })

  return payload.find({
    collection: 'articles',
    where: publishedWhere(...clauses),
    sort: SORT_BY_DATE,
    depth: LIST_DEPTH,
    page,
    limit,
  })
}

/**
 * Nombre d'articles publiés par catégorie, à recherche et tag constants : les
 * compteurs du filtre. La catégorie active n'entre pas dans le calcul, sinon
 * toutes les autres options annonceraient zéro.
 */
export async function countArticlesByCategory({
  type,
  tagSlug,
  search,
}: {
  type: ContentType
  tagSlug?: string
  search?: string
}): Promise<FacetCounts> {
  const payload = await getPayloadClient()
  const categories = await getCategories()

  const clauses: Where[] = [ofType(type)]
  if (tagSlug) clauses.push({ 'tags.slug': { equals: tagSlug } })
  if (search) clauses.push({ or: [{ title: { like: search } }, { excerpt: { like: search } }] })

  const count = (extra?: Where) =>
    payload.count({
      collection: 'articles',
      where: publishedWhere(...clauses, ...(extra ? [extra] : [])),
    })

  const [all, ...perCategory] = await Promise.all([
    count(),
    ...categories.map((category) => count({ 'category.slug': { equals: category.slug } })),
  ])

  return {
    total: all.totalDocs,
    byValue: Object.fromEntries(
      categories.map((category, index) => [category.slug ?? '', perCategory[index].totalDocs]),
    ),
  }
}

/** Document publié d'un slug donné, à condition qu'il soit bien du type demandé. */
export async function getArticleBySlug(slug: string, type: ContentType): Promise<Article | null> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'articles',
    where: publishedWhere(ofType(type), { slug: { equals: slug } }),
    depth: DETAIL_DEPTH,
    limit: 1,
  })

  return docs[0] ?? null
}

/** Articles de fond cochés « À la une » pour la page d'accueil. */
export async function getFeaturedOnHome(limit = 4): Promise<Article[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'articles',
    where: publishedWhere(ofType('article'), { featuredOnHome: { equals: true } }),
    sort: SORT_BY_DATE,
    depth: LIST_DEPTH,
    limit,
  })

  return docs
}

/**
 * Actualité en grand format : celle cochée « Grand format », à défaut la plus
 * récente (§ 2.3).
 */
export async function getFeaturedNews(): Promise<Article | null> {
  const payload = await getPayloadClient()

  const featured = await payload.find({
    collection: 'articles',
    where: publishedWhere(ofType('news'), { featuredInNews: { equals: true } }),
    sort: SORT_BY_DATE,
    depth: LIST_DEPTH,
    limit: 1,
  })

  if (featured.docs[0]) return featured.docs[0]

  const latest = await payload.find({
    collection: 'articles',
    where: publishedWhere(ofType('news')),
    sort: SORT_BY_DATE,
    depth: LIST_DEPTH,
    limit: 1,
  })

  return latest.docs[0] ?? null
}

export type GetLatestNewsArgs = {
  page?: number
  limit?: number
  /**
   * Actualité déjà affichée en grand format : elle est écartée du fil pour ne pas
   * y figurer deux fois (§ 2.3).
   */
  excludeId?: number | null
}

/**
 * Fil d'actualité chronologique et paginé. Aucun filtre de catégorie ni de tag :
 * un fil se lit dans l'ordre, les filtres sont portés par `/articles`.
 */
export async function getLatestNews({
  page = 1,
  limit = 10,
  excludeId,
}: GetLatestNewsArgs = {}): Promise<PaginatedDocs<Article>> {
  return getArticles({
    type: 'news',
    page,
    limit,
    excludeIds: typeof excludeId === 'number' ? [excludeId] : [],
  })
}

/**
 * « Sur le même sujet » : même tag ou même catégorie, article courant exclu.
 * Les deux types de contenu sont admis — l'URL de chaque résultat est déduite
 * de son propre champ `type`.
 */
export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const payload = await getPayloadClient()

  const categoryId = relationId(article.category)
  const tagIds = (article.tags ?? [])
    .map((tag) => relationId(tag))
    .filter((id): id is number => id !== null)

  const affinity: Where[] = []
  if (tagIds.length > 0) affinity.push({ tags: { in: tagIds } })
  if (categoryId !== null) affinity.push({ category: { equals: categoryId } })

  if (affinity.length === 0) return []

  const { docs } = await payload.find({
    collection: 'articles',
    where: publishedWhere({ id: { not_equals: article.id } }, { or: affinity }),
    sort: SORT_BY_DATE,
    depth: LIST_DEPTH,
    limit,
  })

  return docs
}

/** Slugs publiés d'un type donné, pour `generateStaticParams`. */
export async function getPublishedSlugs(type: ContentType): Promise<string[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'articles',
    where: publishedWhere(ofType(type)),
    depth: 0,
    limit: 1000,
    pagination: false,
    select: { slug: true },
  })

  return docs.map((doc) => doc.slug).filter((slug): slug is string => Boolean(slug))
}
