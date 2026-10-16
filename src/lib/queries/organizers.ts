import type { Organizer } from '@/payload-types'

import { getPayloadClient } from './payload'

/**
 * Organisateurs de salons CSE (§ 8), pour valider le paramètre d'URL
 * `?organisateur=`. La liste utilisée par le filtre lui-même vient de
 * `getOrganizersWithEventCount`, qui n'en retient qu'une partie (ceux ayant un
 * salon à venir) ; celle-ci reste complète pour reconnaître un slug valide
 * même sans salon à venir, plutôt que de le traiter comme une valeur inconnue.
 */
export async function getOrganizers(): Promise<Organizer[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'organizers',
    sort: 'name',
    depth: 0,
    limit: 100,
    pagination: false,
  })

  return docs
}
