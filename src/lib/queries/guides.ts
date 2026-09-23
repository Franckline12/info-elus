import type { PaginatedDocs, Where } from 'payload'

import type { Guide } from '@/payload-types'

import { getPayloadClient } from './payload'

/**
 * Lectures publiques de la collection Guides.
 *
 * Comme pour les articles, chaque requête filtre explicitement
 * `_status = published` : la Local API ignore les droits d'accès par défaut.
 */

const PUBLISHED: Where = { _status: { equals: 'published' } }

const LIST_DEPTH = 1
const DETAIL_DEPTH = 2
const SORT_BY_DATE = '-publishedAt'

const publishedWhere = (...clauses: Where[]): Where => ({ and: [PUBLISHED, ...clauses] })

export type GetGuidesArgs = {
  themeSlug?: string
  search?: string
  page?: number
  limit?: number
}

/** Liste paginée, filtrable par thème et par recherche plein texte (§ 2.2). */
export async function getGuides({
  themeSlug,
  search,
  page = 1,
  limit = 9,
}: GetGuidesArgs = {}): Promise<PaginatedDocs<Guide>> {
  const payload = await getPayloadClient()

  const clauses: Where[] = []
  if (themeSlug) clauses.push({ 'theme.slug': { equals: themeSlug } })
  if (search) {
    clauses.push({
      or: [{ title: { like: search } }, { excerpt: { like: search } }],
    })
  }

  return payload.find({
    collection: 'guides',
    where: publishedWhere(...clauses),
    sort: SORT_BY_DATE,
    depth: LIST_DEPTH,
    page,
    limit,
  })
}

/** Guides du rail de l'accueil : ceux mis en avant, complétés par les plus récents. */
export async function getFeaturedGuides(limit = 4): Promise<Guide[]> {
  const payload = await getPayloadClient()

  const featured = await payload.find({
    collection: 'guides',
    where: publishedWhere({ featuredOnHome: { equals: true } }),
    sort: SORT_BY_DATE,
    depth: LIST_DEPTH,
    limit,
  })

  if (featured.docs.length >= limit) return featured.docs

  const ids = featured.docs.map((guide) => guide.id)

  const latest = await payload.find({
    collection: 'guides',
    where: publishedWhere(...(ids.length > 0 ? [{ id: { not_in: ids } } as Where] : [])),
    sort: SORT_BY_DATE,
    depth: LIST_DEPTH,
    limit: limit - featured.docs.length,
  })

  return [...featured.docs, ...latest.docs]
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'guides',
    where: publishedWhere({ slug: { equals: slug } }),
    depth: DETAIL_DEPTH,
    limit: 1,
  })

  return docs[0] ?? null
}

/** « Dans le même thème » : autres guides du thème courant. */
export async function getRelatedGuides(guide: Guide, limit = 3): Promise<Guide[]> {
  const payload = await getPayloadClient()

  const themeId = typeof guide.theme === 'object' && guide.theme ? guide.theme.id : guide.theme

  if (themeId === null || themeId === undefined) return []

  const { docs } = await payload.find({
    collection: 'guides',
    where: publishedWhere({ id: { not_equals: guide.id } }, { theme: { equals: themeId } }),
    sort: SORT_BY_DATE,
    depth: LIST_DEPTH,
    limit,
  })

  return docs
}

/** Slugs publiés, pour `generateStaticParams`. */
export async function getPublishedGuideSlugs(): Promise<string[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'guides',
    where: PUBLISHED,
    depth: 0,
    limit: 1000,
    pagination: false,
    select: { slug: true },
  })

  return docs.map((doc) => doc.slug).filter((slug): slug is string => Boolean(slug))
}
