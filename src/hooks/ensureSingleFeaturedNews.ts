import type { CollectionAfterChangeHook } from 'payload'

/**
 * Drapeau de contexte posé sur les mises à jour déclenchées par ce hook :
 * il empêche la cascade de se relancer en boucle.
 */
const SKIP_SYNC = 'skipFeaturedNewsSync'

/**
 * Une seule actualité peut être en « grand format ». Quand une actualité est
 * enregistrée avec la case cochée, on décoche toutes les autres.
 *
 * (`featuredOnHome`, lui, reste multiple : aucune exclusivité à faire respecter.)
 */
export const ensureSingleFeaturedNews: CollectionAfterChangeHook = async ({
  collection,
  context,
  doc,
  req,
}) => {
  if (context[SKIP_SYNC] || doc?.type !== 'news' || !doc?.featuredInNews) {
    return doc
  }

  const { docs: previouslyFeatured } = await req.payload.find({
    collection: collection.slug,
    depth: 0,
    pagination: false,
    req,
    select: { _status: true },
    where: {
      and: [{ id: { not_equals: doc.id } }, { featuredInNews: { equals: true } }],
    },
  })

  // Séquentiel : ces écritures partagent la transaction portée par `req`.
  for (const other of previouslyFeatured) {
    try {
      await req.payload.update({
        id: other.id,
        collection: collection.slug,
        context: { [SKIP_SYNC]: true },
        data: {
          featuredInNews: false,
          // On conserve l'état du document : décocher ne doit rien publier.
          _status: (other as { _status?: 'draft' | 'published' | null })._status ?? 'draft',
        },
        depth: 0,
        req,
      })
    } catch (error) {
      // Un brouillon incomplet peut échouer à la validation : on le signale
      // sans faire échouer l'enregistrement en cours.
      req.payload.logger.error(
        { err: error, id: other.id },
        'Impossible de retirer le grand format de cette actualité',
      )
    }
  }

  return doc
}
