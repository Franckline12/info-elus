import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache.js'

import type { Article } from '../payload-types'

const listingPath = (type: Article['type']): string =>
  type === 'news' ? '/actualite' : '/articles'

const pathsFor = (doc: Pick<Article, 'type'> & { slug?: string | null }): string[] => {
  const listing = listingPath(doc.type)
  return [...(doc.slug ? [`${listing}/${doc.slug}`] : []), listing, '/']
}

/**
 * `revalidatePath` lève une exception hors d'un contexte de requête Next
 * (scripts de seed, tests, CLI Payload). Le contenu reste correct — il sera
 * régénéré par l'ISR — donc on se contente de tracer.
 */
const revalidate = (
  paths: string[],
  logger: { info: (m: string) => void; warn: (m: string) => void },
) => {
  for (const path of paths) {
    try {
      revalidatePath(path)
      logger.info(`Revalidation de ${path}`)
    } catch {
      logger.warn(`Revalidation impossible hors contexte Next : ${path}`)
    }
  }
}

/**
 * Publier ou modifier un article dans l'admin met le site à jour immédiatement.
 *
 * Les enregistrements automatiques de brouillon (autosave) sont ignorés : leur
 * `_status` vaut `draft`, et le contenu publié n'a pas bougé. Seules la
 * publication, la modification d'un document publié et la dépublication
 * déclenchent une revalidation.
 */
export const revalidateArticle: CollectionAfterChangeHook<Article> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  const paths = new Set<string>()

  if (doc._status === 'published') {
    pathsFor(doc).forEach((path) => paths.add(path))
  }

  // Dépublication, ou changement de slug / de type : l'ancienne URL doit être
  // purgée elle aussi, sinon elle continue de servir la version en cache.
  if (previousDoc?._status === 'published') {
    const slugChanged = previousDoc.slug !== doc.slug
    const typeChanged = previousDoc.type !== doc.type
    const unpublished = doc._status !== 'published'

    if (slugChanged || typeChanged || unpublished) {
      pathsFor(previousDoc).forEach((path) => paths.add(path))
    }
  }

  if (paths.size > 0) revalidate([...paths], payload.logger)

  return doc
}

export const revalidateArticleDelete: CollectionAfterDeleteHook<Article> = ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  // Supprimer un brouillon ne change rien au site publié : rien à purger.
  if (doc._status !== 'published') return doc

  revalidate(pathsFor(doc), payload.logger)

  return doc
}
