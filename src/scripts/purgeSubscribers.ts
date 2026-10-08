import { getPayload } from 'payload'

import config from '../payload.config'

/**
 * Purge des inscriptions jamais confirmées (§ 4.4).
 *
 * Une adresse restée « en attente » au-delà de la validité de son jeton n'a
 * pas de base légale pour être conservée : aucun consentement n'a été donné, et
 * le lien de confirmation ne fonctionne plus. On la supprime, purement et
 * simplement — la personne peut toujours se réinscrire.
 *
 * À lancer avec `npm run purge:subscribers`. Aucune tâche planifiée n'est
 * installée : la périodicité sera décidée au déploiement.
 */

const payload = await getPayload({ config })

const now = new Date().toISOString()

const { docs } = await payload.delete({
  collection: 'subscribers',
  where: {
    and: [
      { status: { equals: 'pending' } },
      {
        or: [
          { tokenExpiresAt: { less_than: now } },
          // Filet de sécurité : une demande sans date d'expiration lisible
          // (import, écriture manuelle) est traitée comme expirée.
          { tokenExpiresAt: { exists: false } },
        ],
      },
    ],
  },
  depth: 0,
  overrideAccess: true,
})

payload.logger.info(
  `Purge des inscriptions non confirmées : ${docs.length} adresse(s) supprimée(s).`,
)

process.exit(0)
