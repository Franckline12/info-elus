import type { CollectionBeforeChangeHook } from 'payload'

import { calculateReadingTime } from '../utilities/readingTime'

/**
 * Recalcule le temps de lecture à chaque enregistrement, à partir du corps de
 * l'article. Si la requête ne porte pas sur le contenu (mise à jour partielle),
 * on repart de la version déjà enregistrée.
 */
export const setReadingTime: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const content = data?.content ?? originalDoc?.content

  if (!content) {
    return data
  }

  return {
    ...data,
    readingTime: calculateReadingTime(content),
  }
}
