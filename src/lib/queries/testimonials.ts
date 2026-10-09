import type { Testimonial } from '@/payload-types'

import { pickWeekly } from '../weeklyRotation'
import { getPayloadClient } from './payload'

/** Témoignages retenus pour la rotation : au-delà, la file ne tournerait jamais. */
const ROTATION_SIZE = 20

/**
 * Témoignage affiché à côté du bloc newsletter (§ 2.6, « bloc témoignage d'élu
 * en rotation »). Les paroles viennent du CMS, pas du code : elles tournent
 * d'une semaine sur l'autre — en même temps que la lettre hebdomadaire — dans
 * leur ordre d'ajout, un tri par date de création et non de modification, pour
 * qu'une relecture ne rebatte pas les cartes.
 */
export async function getTestimonial(date: Date = new Date()): Promise<Testimonial | null> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'testimonials',
    where: { _status: { equals: 'published' } },
    sort: 'createdAt',
    depth: 0,
    limit: ROTATION_SIZE,
  })

  return pickWeekly(docs, date)
}
