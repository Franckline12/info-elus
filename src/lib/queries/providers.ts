import type { PaginatedDocs, Where } from 'payload'

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
