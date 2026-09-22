import type { Access } from 'payload'

/** Écriture (et lecture intégrale) réservée aux utilisateurs connectés à l'admin. */
export const loggedIn: Access = ({ req: { user } }) => Boolean(user)
