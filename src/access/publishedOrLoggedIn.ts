import type { Access } from 'payload'

/**
 * Lecture des contenus versionnés : un visiteur non connecté ne voit que les
 * documents publiés, un utilisateur connecté voit aussi les brouillons.
 *
 * À n'utiliser que sur les collections dont `versions.drafts` est activé,
 * puisque la contrainte porte sur le champ `_status`.
 */
export const publishedOrLoggedIn: Access = ({ req: { user } }) => {
  if (user) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
