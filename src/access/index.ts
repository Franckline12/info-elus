import type { Access } from 'payload'

export { loggedIn } from './loggedIn'
export { publishedOrLoggedIn } from './publishedOrLoggedIn'

/** Lecture publique. */
export const anyone: Access = () => true

/** Alias historique de `loggedIn`, utilisé par les collections de taxonomies. */
export { loggedIn as authenticated } from './loggedIn'
