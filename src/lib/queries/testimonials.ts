import type { Testimonial } from '@/payload-types'

import { getPayloadClient } from './payload'

/**
 * Témoignage affiché à côté du bloc newsletter (§ 2.6). La rotation se fait à
 * chaque régénération de la page : on prend le plus récemment modifié.
 */
export async function getTestimonial(): Promise<Testimonial | null> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'testimonials',
    where: { _status: { equals: 'published' } },
    sort: '-updatedAt',
    depth: 0,
    limit: 1,
  })

  return docs[0] ?? null
}
