import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache.js'

type VersionedDoc = {
  id: number | string
  slug?: string | null
  _status?: ('draft' | 'published') | null
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

const pathsFor = (listing: string, doc: VersionedDoc): string[] => [
  ...(doc.slug ? [`${listing}/${doc.slug}`] : []),
  listing,
  '/',
]

/**
 * Fabrique les hooks de revalidation d'une collection de contenu dont les URL
 * suivent `\<listing\>` et `\<listing\>/\<slug\>` (guides, quiz, prestataires).
 *
 * Même logique que pour les articles : les enregistrements automatiques de
 * brouillon sont ignorés, et l'ancienne URL est purgée quand le slug change ou
 * que le document est dépublié.
 */
export const revalidateContent = (listing: string) => {
  const afterChange: CollectionAfterChangeHook<VersionedDoc> = ({
    doc,
    previousDoc,
    req: { payload, context },
  }) => {
    if (context.disableRevalidate) return doc

    const paths = new Set<string>()

    if (doc._status === 'published') {
      pathsFor(listing, doc).forEach((path) => paths.add(path))
    }

    if (previousDoc?._status === 'published') {
      const slugChanged = previousDoc.slug !== doc.slug
      const unpublished = doc._status !== 'published'

      if (slugChanged || unpublished) {
        pathsFor(listing, previousDoc).forEach((path) => paths.add(path))
      }
    }

    if (paths.size > 0) revalidate([...paths], payload.logger)

    return doc
  }

  const afterDelete: CollectionAfterDeleteHook<VersionedDoc> = ({
    doc,
    req: { payload, context },
  }) => {
    if (context.disableRevalidate) return doc

    // Supprimer un brouillon ne change rien au site publié : rien à purger.
    if (doc._status !== 'published') return doc

    revalidate(pathsFor(listing, doc), payload.logger)

    return doc
  }

  return { afterChange, afterDelete }
}
