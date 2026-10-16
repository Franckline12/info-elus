import type { Where } from 'payload'

import type { FilterOption } from '@/lib/filterOptions'
import { startOfTodayParis } from '@/lib/formatDate'
import { eventRegionOptions } from '@/lib/interventionAreas'
import type { Event } from '@/payload-types'

import { getPayloadClient } from './payload'

/**
 * Lectures publiques des salons CSE (rubrique Salons, § 8).
 *
 * Comme pour les prestataires, pas de brouillons : le filtre `published` est
 * donc posé explicitement sur chaque lecture, même si l'access control
 * l'appliquerait déjà.
 *
 * Particularité de cette rubrique : à la différence des autres contenus, le
 * classement à venir/passé ne dépend d'aucune action éditoriale, seulement de
 * la date du jour. « Aujourd'hui » est calculé une fois par appel avec
 * `startOfTodayParis`, pour que les deux moitiés d'une même requête (à venir
 * et passé) ne puissent jamais se chevaucher ni laisser de trou.
 */

const PUBLISHED: Where = { published: { equals: true } }

/** Un salon reste à venir jusqu'à la fin de sa dernière journée, pas jusqu'à son début. */
const upcomingWhere = (now: Date): Where => ({
  endDate: { greater_than_equal: now.toISOString() },
})

const pastWhere = (now: Date): Where => ({
  endDate: { less_than: now.toISOString() },
})

export type GetUpcomingEventsArgs = {
  organizerSlug?: string
  region?: string
  limit?: number
}

/** Salons à venir, du plus proche au plus lointain. */
export async function getUpcomingEvents({
  organizerSlug,
  region,
  limit = 100,
}: GetUpcomingEventsArgs = {}): Promise<Event[]> {
  const payload = await getPayloadClient()
  const now = startOfTodayParis()

  const { docs } = await payload.find({
    collection: 'events',
    where: {
      and: [
        PUBLISHED,
        upcomingWhere(now),
        ...(organizerSlug ? [{ 'organizer.slug': { equals: organizerSlug } } satisfies Where] : []),
        ...(region ? [{ region: { equals: region } } satisfies Where] : []),
      ],
    },
    sort: 'startDate',
    depth: 1,
    limit,
    pagination: false,
  })

  return docs
}

export type GetPastEventsArgs = {
  page?: number
  limit?: number
}

/** Éditions passées, paginées, de la plus récente à la plus ancienne. */
export async function getPastEvents({ page = 1, limit = 12 }: GetPastEventsArgs = {}) {
  const payload = await getPayloadClient()
  const now = startOfTodayParis()

  return payload.find({
    collection: 'events',
    where: { and: [PUBLISHED, pastWhere(now)] },
    sort: '-startDate',
    depth: 1,
    page,
    limit,
  })
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'events',
    where: { and: [PUBLISHED, { slug: { equals: slug } }] },
    depth: 1,
    limit: 1,
  })

  return docs[0] ?? null
}

/** Le prochain salon à venir, pour un éventuel encart (ex. page d'accueil). */
export async function getNextEvent(): Promise<Event | null> {
  const payload = await getPayloadClient()
  const now = startOfTodayParis()

  const { docs } = await payload.find({
    collection: 'events',
    where: { and: [PUBLISHED, upcomingWhere(now)] },
    sort: 'startDate',
    depth: 1,
    limit: 1,
  })

  return docs[0] ?? null
}

/**
 * Organisateurs du filtre, avec leur nombre de salons à venir publiés.
 *
 * Un organisateur sans salon à venir n'est pas proposé : il n'aurait rien à
 * montrer si on le choisissait. Les éditions passées ne comptent pas, le
 * filtre n'existant que sur la liste des salons à venir (§ 8).
 *
 * `region` compte à zone constante : comme pour les prestataires, chaque
 * filtre se compte sans lui-même, l'autre filtre restant actif, pour que les
 * deux familles (organisateur, région) restent cumulables.
 */
export async function getOrganizersWithEventCount({
  region,
}: { region?: string } = {}): Promise<FilterOption[]> {
  const payload = await getPayloadClient()
  const now = startOfTodayParis()

  const { docs: organizers } = await payload.find({
    collection: 'organizers',
    sort: 'name',
    depth: 0,
    limit: 100,
    pagination: false,
  })

  const counts = await Promise.all(
    organizers.map((organizer) =>
      payload.count({
        collection: 'events',
        where: {
          and: [
            PUBLISHED,
            upcomingWhere(now),
            { organizer: { equals: organizer.id } },
            ...(region ? [{ region: { equals: region } } satisfies Where] : []),
          ],
        },
      }),
    ),
  )

  return organizers.flatMap((organizer, index) =>
    counts[index].totalDocs > 0 && organizer.slug
      ? [{ value: organizer.slug, label: organizer.name, count: counts[index].totalDocs }]
      : [],
  )
}

/** Même logique que `getOrganizersWithEventCount`, pour le filtre régional. */
export async function getEventRegionsWithCount({
  organizerSlug,
}: { organizerSlug?: string } = {}): Promise<FilterOption[]> {
  const payload = await getPayloadClient()
  const now = startOfTodayParis()

  const { docs } = await payload.find({
    collection: 'events',
    where: {
      and: [
        PUBLISHED,
        upcomingWhere(now),
        ...(organizerSlug ? [{ 'organizer.slug': { equals: organizerSlug } } satisfies Where] : []),
      ],
    },
    depth: 0,
    limit: 1000,
    pagination: false,
    select: { region: true },
  })

  const regions = docs.map((doc) => doc.region).filter((region): region is NonNullable<Event['region']> => Boolean(region))

  return eventRegionOptions.flatMap((option) => {
    const count = regions.filter((region) => region === option.value).length
    return count > 0 ? [{ value: option.value, label: option.label, count }] : []
  })
}

export type GetRelatedEventsArgs = {
  organizerId: number
  region: string
  excludeId: number
  limit?: number
}

/**
 * Salons à venir du même organisateur ou de la même région, hors le salon
 * courant (fiche d'un salon, § 8 : « autres salons du même organisateur, ou
 * dans la même région »).
 */
export async function getRelatedEvents({
  organizerId,
  region,
  excludeId,
  limit = 3,
}: GetRelatedEventsArgs): Promise<Event[]> {
  const payload = await getPayloadClient()
  const now = startOfTodayParis()

  const { docs } = await payload.find({
    collection: 'events',
    where: {
      and: [
        PUBLISHED,
        upcomingWhere(now),
        { id: { not_equals: excludeId } },
        { or: [{ organizer: { equals: organizerId } }, { region: { equals: region } }] },
      ],
    },
    sort: 'startDate',
    depth: 1,
    limit,
  })

  return docs
}

/** Slugs des salons en ligne (à venir ou passés), pour `generateStaticParams`. */
export async function getPublishedEventSlugs(): Promise<string[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'events',
    where: PUBLISHED,
    depth: 0,
    limit: 1000,
    pagination: false,
    select: { slug: true },
  })

  return docs.map((doc) => doc.slug).filter((slug): slug is string => Boolean(slug))
}
