import type { Category } from '@/payload-types'

import { getPayloadClient } from './payload'

/** Catégories utilisées par le filtre des listings. Lecture publique (§ 2.1). */
export async function getCategories(): Promise<Category[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'categories',
    sort: 'name',
    depth: 0,
    limit: 100,
    pagination: false,
  })

  return docs
}
