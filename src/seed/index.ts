import { getPayload } from 'payload'

import config from '../payload.config'
import { seedGuides } from './guides'
import { seedProviders } from './providers'
import { seedQuizzes } from './quizzes'

/**
 * Jeu de données de démonstration, exécuté par `npm run seed`.
 *
 * Rejouable : chaque section du seed réutilise les documents existants ou les
 * remplace, elle n'empile jamais de doublons.
 */
const seed = async () => {
  const payload = await getPayload({ config })

  payload.logger.info('Seed : guides')
  await seedGuides(payload)

  payload.logger.info('Seed : quiz')
  await seedQuizzes(payload)

  payload.logger.info('Seed : prestataires')
  await seedProviders(payload)

  payload.logger.info('Seed terminé.')
  process.exit(0)
}

await seed()
