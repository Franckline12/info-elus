import type { Tag } from '@/payload-types'

import { getPayloadClient } from './payload'

/** Tags de la taxonomie commune (§ 2.3), pour les nuages de tags des listings. */
export async function getTags(limit = 12): Promise<Tag[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'tags',
    sort: 'name',
    depth: 0,
    limit,
  })

  return docs
}
