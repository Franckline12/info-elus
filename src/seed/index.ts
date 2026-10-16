import { getPayload } from 'payload'

import config from '../payload.config'
import { seedDrafts } from './drafts'
import { seedEvents } from './events'
import { seedGuides } from './guides'
import { seedNews } from './news'
import { seedProviders } from './providers'
import { seedQuizzes } from './quizzes'
import { seedTestimonials } from './testimonials'

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

  payload.logger.info('Seed : actualité')
  await seedNews(payload)

  payload.logger.info('Seed : quiz')
  await seedQuizzes(payload)

  payload.logger.info('Seed : prestataires')
  await seedProviders(payload)

  payload.logger.info('Seed : salons')
  await seedEvents(payload)

  payload.logger.info('Seed : témoignages')
  await seedTestimonials(payload)

  // En dernier : les brouillons réutilisent les taxonomies et les visuels que
  // les sections précédentes ont déjà mis en place.
  payload.logger.info('Seed : brouillons')
  await seedDrafts(payload)

  payload.logger.info('Seed terminé.')
  process.exit(0)
}

await seed()
