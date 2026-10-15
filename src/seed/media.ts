import path from 'path'
import type { Payload } from 'payload'

import type { Media } from '../payload-types'

export type SeedImage = {
  /** Chemin du fichier dans le dépôt, relatif à la racine du projet. */
  source: string
  alt: string
}

/**
 * Téléverse les visuels de démonstration manquants et renvoie la
 * correspondance clé → identifiant de média.
 *
 * Partagé par les seeds d'actualité et de brouillons : les deux puisent dans
 * les mêmes photographies versionnées, et le script doit rester rejouable. Un
 * média déjà en base — téléversé par un précédent passage ou par l'équipe
 * éditoriale — est réutilisé tel quel, jamais remplacé.
 */
export const ensureImages = async (
  payload: Payload,
  images: Record<string, SeedImage>,
): Promise<Map<string, number>> => {
  const map = new Map<string, number>()

  for (const [key, image] of Object.entries(images)) {
    const filename = path.basename(image.source)

    const { docs } = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
    })

    const existing = docs[0] as Media | undefined
    if (existing) {
      map.set(key, existing.id)
      continue
    }

    const created = await payload.create({
      collection: 'media',
      data: { alt: image.alt },
      filePath: path.join(process.cwd(), image.source),
    })
    payload.logger.info(`Visuel téléversé : ${filename}`)
    map.set(key, created.id)
  }

  return map
}
