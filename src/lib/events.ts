import type { Event } from '@/payload-types'

import { formatDateRange, formatMonthLabel, startOfTodayParis, toDate } from './formatDate'

/**
 * Un salon reste à venir jusqu'à la fin de sa dernière journée, pas jusqu'à
 * son début (rubrique Salons CSE, § 8). Même règle que les requêtes de
 * `lib/queries/events.ts`, pour le seul cas où une page a déjà le document en
 * main (fiche d'un salon) et n'a pas besoin d'une requête dédiée.
 */
export const isPastEvent = (
  event: Pick<Event, 'endDate'>,
  now: Date = startOfTodayParis(),
): boolean => {
  const end = toDate(event.endDate)
  return end !== null && end.getTime() < now.getTime()
}

export type EventMonthGroup = { label: string; events: Event[] }

/**
 * Regroupe des salons déjà triés par date de début croissante en paquets
 * mensuels (« Novembre 2026 », « Mars 2027 »…). S'appuie sur le tri d'entrée :
 * deux salons du même mois se suivent toujours dans la liste, un simple « même
 * étiquette que le groupe courant ? » suffit donc, sans structure de recherche.
 */
export const groupEventsByMonth = (events: Event[]): EventMonthGroup[] => {
  const groups: EventMonthGroup[] = []

  for (const event of events) {
    const label = formatMonthLabel(event.startDate)
    const current = groups[groups.length - 1]

    if (current && current.label === label) {
      current.events.push(event)
    } else {
      groups.push({ label, events: [event] })
    }
  }

  return groups
}

type EventSeoFields = {
  city?: string | null
  venue?: string | null
  startDate?: string | null
  endDate?: string | null
}

/**
 * Description courte dérivée de la ville, des dates et du lieu — utilisée à la
 * fois par le plugin SEO (`payload.config.ts`) et par le JSON-LD `Event` de la
 * fiche, pour ne pas écrire deux fois la même dérivation.
 */
export const eventSeoDescription = (event: EventSeoFields): string =>
  [event.city, formatDateRange(event.startDate, event.endDate), event.venue]
    .filter(Boolean)
    .join(' — ')
