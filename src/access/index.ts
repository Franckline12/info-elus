import type { Access } from 'payload'

/** Lecture publique. */
export const anyone: Access = () => true

/** Écriture réservée aux utilisateurs connectés à l'admin. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)
