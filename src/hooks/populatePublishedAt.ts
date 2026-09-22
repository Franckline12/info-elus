import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Renseigne la date de publication le jour où le document passe en « publié »,
 * si l'équipe éditoriale ne l'a pas saisie.
 *
 * Conséquence volontaire : on ne peut pas vider la date d'un document publié,
 * elle est alors restaurée (ou remplacée par la date du jour).
 */
export const populatePublishedAt: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (data?._status !== 'published' || data.publishedAt) {
    return data
  }

  return {
    ...data,
    publishedAt: originalDoc?.publishedAt ?? new Date().toISOString(),
  }
}
