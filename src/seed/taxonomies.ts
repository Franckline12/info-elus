import type { Payload } from 'payload'

import type { Theme } from '../payload-types'

export type SeedTheme = {
  slug: string
  name: string
  color: Theme['color']
}

/**
 * Crée les thèmes manquants et renvoie la correspondance slug → identifiant.
 *
 * Partagé par les seeds de guides et de quiz : les deux rubriques s'appuient
 * sur la même taxonomie, et le script doit rester rejouable.
 */
export const ensureThemes = async (
  payload: Payload,
  themes: SeedTheme[],
): Promise<Map<string, number>> => {
  const map = new Map<string, number>()

  for (const theme of themes) {
    const { docs } = await payload.find({
      collection: 'themes',
      where: { slug: { equals: theme.slug } },
      limit: 1,
      depth: 0,
    })

    const existing = docs[0]
    if (existing) {
      map.set(theme.slug, existing.id)
      continue
    }

    const created = await payload.create({
      collection: 'themes',
      data: { name: theme.name, slug: theme.slug, color: theme.color },
    })
    payload.logger.info(`Thème créé : ${theme.name}`)
    map.set(theme.slug, created.id)
  }

  return map
}
