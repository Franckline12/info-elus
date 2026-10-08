import type { PaginatedDocs, Where } from 'payload'

import type { FacetCounts } from '@/lib/filterOptions'
import type { Guide, Theme } from '@/payload-types'

import { getPayloadClient } from './payload'
import { getThemes } from './themes'

/**
 * Lectures publiques de la collection Guides.
 *
 * Comme pour les articles, chaque requête filtre explicitement
 * `_status = published` : la Local API ignore les droits d'accès par défaut,
 * un brouillon fuiterait sans ce garde-fou.
 *
 * La profondeur reste à 1 : elle suffit à peupler le thème, les tags, l'image
 * et les fichiers des ressources, qui sont tous des relations de premier rang.
 */

const PUBLISHED: Where = { _status: { equals: 'published' } }

const DEPTH = 1
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
      or: [{ title: { like: search } }, { summary: { like: search } }],
    })
  }

  return payload.find({
    collection: 'guides',
    where: publishedWhere(...clauses),
    sort: SORT_BY_DATE,
    depth: DEPTH,
    page,
    limit,
  })
}

/**
 * Nombre de guides publiés par thème, à recherche constante : les compteurs du
 * filtre. Le thème actif n'entre pas dans le calcul, sinon toutes les autres
 * options annonceraient zéro.
 */
export async function countGuidesByTheme({ search }: { search?: string } = {}): Promise<FacetCounts> {
  const payload = await getPayloadClient()
  const themes = await getThemes()

  const clauses: Where[] = []
  if (search) clauses.push({ or: [{ title: { like: search } }, { summary: { like: search } }] })

  const count = (extra?: Where) =>
    payload.count({
      collection: 'guides',
      where: publishedWhere(...clauses, ...(extra ? [extra] : [])),
    })

  const [all, ...perTheme] = await Promise.all([
    count(),
    ...themes.map((theme) => count({ 'theme.slug': { equals: theme.slug } })),
  ])

  return {
    total: all.totalDocs,
    byValue: Object.fromEntries(
      themes.map((theme, index) => [theme.slug ?? '', perTheme[index].totalDocs]),
    ),
  }
}

/**
 * Guides du rail de l'accueil : ceux mis en avant par l'équipe éditoriale,
 * complétés par les plus récents pour que le rail ne soit jamais à moitié vide.
 */
export async function getGuidesForHome(limit = 4): Promise<Guide[]> {
  const payload = await getPayloadClient()

  const featured = await payload.find({
    collection: 'guides',
    where: publishedWhere({ featuredOnHome: { equals: true } }),
    sort: SORT_BY_DATE,
    depth: DEPTH,
    limit,
  })

  if (featured.docs.length >= limit) return featured.docs

  const ids = featured.docs.map((guide) => guide.id)

  const latest = await payload.find({
    collection: 'guides',
    where: publishedWhere(...(ids.length > 0 ? [{ id: { not_in: ids } } as Where] : [])),
    sort: SORT_BY_DATE,
    depth: DEPTH,
    limit: limit - featured.docs.length,
  })

  return [...featured.docs, ...latest.docs]
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'guides',
    where: publishedWhere({ slug: { equals: slug } }),
    depth: DEPTH,
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
    depth: DEPTH,
    limit,
  })

  return docs
}

export type ThemeWithGuideCount = Theme & { guideCount: number }

/**
 * Thèmes du filtre du listing : uniquement ceux qui comptent au moins un guide
 * publié, pour ne jamais proposer un filtre qui mène à une page vide.
 *
 * Deux requêtes suffisent : les identifiants de thème de tous les guides
 * publiés, puis les thèmes eux-mêmes. Le comptage se fait en mémoire.
 */
export async function getThemesWithGuideCount(): Promise<ThemeWithGuideCount[]> {
  const payload = await getPayloadClient()

  const [{ docs: guides }, themes] = await Promise.all([
    payload.find({
      collection: 'guides',
      where: PUBLISHED,
      depth: 0,
      pagination: false,
      select: { theme: true },
    }),
    getThemes(),
  ])

  const counts = new Map<number, number>()

  for (const guide of guides) {
    // `depth: 0` renvoie l'identifiant, mais la relation peut être absente sur
    // un document créé avant que le champ ne devienne obligatoire.
    const id = typeof guide.theme === 'object' && guide.theme ? guide.theme.id : guide.theme
    if (typeof id !== 'number') continue
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }

  return themes
    .filter((theme) => counts.has(theme.id))
    .map((theme) => ({ ...theme, guideCount: counts.get(theme.id) ?? 0 }))
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
