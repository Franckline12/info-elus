import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache.js'

type RevalidatedDoc = {
  id: number | string
  slug?: string | null
  _status?: ('draft' | 'published') | null
  published?: boolean | null
}

/** Lecture par défaut de l'état de publication : celui des collections versionnées. */
const byStatus = (doc: RevalidatedDoc): boolean => doc._status === 'published'

/** Variante des collections publiées par une case à cocher (prestataires, § 2.4). */
export const byPublishedFlag = (doc: RevalidatedDoc): boolean => doc.published === true

type RevalidateOptions = {
  /**
   * Comment déterminer qu'un document est en ligne. Par défaut `_status` ;
   * l'annuaire des prestataires passe `byPublishedFlag`.
   */
  isPublished?: (doc: RevalidatedDoc) => boolean
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

const pathsFor = (listing: string, doc: RevalidatedDoc): string[] => [
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
export const revalidateContent = (
  listing: string,
  { isPublished = byStatus }: RevalidateOptions = {},
) => {
  const afterChange: CollectionAfterChangeHook<RevalidatedDoc> = ({
    doc,
    previousDoc,
    req: { payload, context },
  }) => {
    if (context.disableRevalidate) return doc

    const paths = new Set<string>()

    if (isPublished(doc)) {
      pathsFor(listing, doc).forEach((path) => paths.add(path))
    }

    if (previousDoc && isPublished(previousDoc)) {
      const slugChanged = previousDoc.slug !== doc.slug
      const unpublished = !isPublished(doc)

      if (slugChanged || unpublished) {
        pathsFor(listing, previousDoc).forEach((path) => paths.add(path))
      }
    }

    if (paths.size > 0) revalidate([...paths], payload.logger)

    return doc
  }

  const afterDelete: CollectionAfterDeleteHook<RevalidatedDoc> = ({
    doc,
    req: { payload, context },
  }) => {
    if (context.disableRevalidate) return doc

    // Supprimer un document non publié ne change rien au site : rien à purger.
    if (!isPublished(doc)) return doc

    revalidate(pathsFor(listing, doc), payload.logger)

    return doc
  }

  return { afterChange, afterDelete }
}
