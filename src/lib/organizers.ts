import type { Event, Organizer } from '@/payload-types'

/**
 * Le champ `organizer` d'un salon vaut un identifiant à `depth: 0`, le
 * document complet au-delà. Même garde-fou que `providerCategory` pour les
 * prestataires.
 */
export const eventOrganizer = (
  value: Event['organizer'] | null | undefined,
): Organizer | null => (value && typeof value === 'object' ? value : null)
