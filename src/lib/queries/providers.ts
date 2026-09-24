import type { PaginatedDocs, Where } from 'payload'

import type { FacetCounts } from '@/lib/filterOptions'
import { providerCategoryOptions } from '@/lib/providerCategories'
import type { Provider } from '@/payload-types'

import { getPayloadClient } from './payload'

/** Lectures publiques de l'annuaire des prestataires (§ 2.4). */

const PUBLISHED: Where = { _status: { equals: 'published' } }

export type GetProvidersArgs = {
  category?: string
  search?: string
  page?: number
  limit?: number
}

export async function getProviders({
  category,
  search,
  page = 1,
  limit = 12,
}: GetProvidersArgs = {}): Promise<PaginatedDocs<Provider>> {
  const payload = await getPayloadClient()

  const clauses: Where[] = []
  if (category) clauses.push({ category: { equals: category } })
  if (search) {
    clauses.push({ or: [{ name: { like: search } }, { description: { like: search } }] })
  }

  return payload.find({
    collection: 'providers',
    where: { and: [PUBLISHED, ...clauses] },
    sort: 'name',
    depth: 1,
    page,
    limit,
  })
}

/**
 * Nombre de prestataires publiés par catégorie, à recherche constante : les
 * compteurs du filtre. La catégorie active n'entre pas dans le calcul.
 */
export async function countProvidersByCategory({
  search,
}: { search?: string } = {}): Promise<FacetCounts> {
  const payload = await getPayloadClient()

  const clauses: Where[] = []
  if (search) {
    clauses.push({ or: [{ name: { like: search } }, { description: { like: search } }] })
  }

  const count = (extra?: Where) =>
    payload.count({
      collection: 'providers',
      where: { and: [PUBLISHED, ...clauses, ...(extra ? [extra] : [])] },
    })

  const [all, ...perCategory] = await Promise.all([
    count(),
    ...providerCategoryOptions.map((option) => count({ category: { equals: option.value } })),
  ])

  return {
    total: all.totalDocs,
    byValue: Object.fromEntries(
      providerCategoryOptions.map((option, index) => [option.value, perCategory[index].totalDocs]),
    ),
  }
}

export async function getProviderBySlug(slug: string): Promise<Provider | null> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'providers',
    where: { and: [PUBLISHED, { slug: { equals: slug } }] },
    depth: 1,
    limit: 1,
  })

  return docs[0] ?? null
}

export async function getPublishedProviderSlugs(): Promise<string[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'providers',
    where: PUBLISHED,
    depth: 0,
    limit: 1000,
    pagination: false,
    select: { slug: true },
  })

  return docs.map((doc) => doc.slug).filter((slug): slug is string => Boolean(slug))
}
