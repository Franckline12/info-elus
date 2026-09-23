import type { Theme } from '@/payload-types'

import { getPayloadClient } from './payload'

/** Thèmes des guides, pour le filtre du listing (§ 2.2). Lecture publique. */
export async function getThemes(): Promise<Theme[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'themes',
    sort: 'name',
    depth: 0,
    limit: 100,
    pagination: false,
  })

  return docs
}
