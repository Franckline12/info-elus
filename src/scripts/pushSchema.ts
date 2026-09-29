import { getPayload } from 'payload'

import config from '../payload.config'

/**
 * Applique le schéma de développement à la base (push Drizzle) sans rien
 * écrire d'autre. Utile après un changement de collection, quand on ne veut pas
 * lancer le serveur Next pour cela.
 */
const payload = await getPayload({ config })
payload.logger.info('Schéma synchronisé.')
process.exit(0)
