import type { Access } from 'payload'

/**
 * Lecture des collections dont la mise en ligne tient à une case à cocher
 * `published` plutôt qu'au système de versions : un visiteur non connecté ne
 * voit que les documents cochés, un utilisateur de l'admin voit tout.
 *
 * Pendant de `publishedOrLoggedIn` pour l'annuaire des prestataires (§ 2.4),
 * qui n'a pas de brouillons : la case sert de validation par l'équipe
 * éditoriale, et la contrainte porte donc sur `published`, pas sur `_status`.
 */
export const publishedFlagOrLoggedIn: Access = ({ req: { user } }) => {
  if (user) {
    return true
  }

  return {
    published: {
      equals: true,
    },
  }
}
