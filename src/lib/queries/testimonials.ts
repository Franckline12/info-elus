import type { Testimonial } from '@/payload-types'

import { getPayloadClient } from './payload'

/** Témoignages retenus pour la rotation : au-delà, la file ne tournerait jamais. */
const ROTATION_SIZE = 20

/**
 * Numéro de semaine ISO, qui sert d'index de rotation : la parole d'élu change
 * en même temps que la lettre hebdomadaire, et reste stable entre deux
 * régénérations de la page d'accueil.
 */
const weekNumber = (date: Date): number => {
  const thursday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  // Jeudi de la semaine courante : c'est lui qui détermine l'année ISO.
  thursday.setUTCDate(thursday.getUTCDate() + 3 - ((thursday.getUTCDay() + 6) % 7))
  const firstThursday = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4))

  return 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * 86400000))
}

/**
 * Témoignage affiché à côté du bloc newsletter (§ 2.6, « bloc témoignage d'élu
 * en rotation »). Les paroles viennent du CMS, pas du code : elles tournent
 * d'une semaine sur l'autre, dans leur ordre d'ajout — un tri par date de
 * création, et non de modification, pour qu'une relecture ne rebatte pas les
 * cartes.
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

  if (docs.length === 0) return null

  return docs[weekNumber(date) % docs.length] ?? null
}
