import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { startOfTodayParis } from '@/lib/formatDate'
import {
  getEventBySlug,
  getNextEvent,
  getOrganizersWithEventCount,
  getPastEvents,
  getUpcomingEvents,
} from '@/lib/queries/events'
import type { Organizer } from '@/payload-types'

/**
 * Particularité de la rubrique Salons (§ 8) : à la différence des autres
 * contenus, le classement à venir/passé ne dépend d'aucune action éditoriale,
 * seulement de la date du jour. Le cas limite — un salon qui se termine
 * aujourd'hui — doit donc être vérifié explicitement : il reste « à venir »
 * jusqu'à la fin de sa dernière journée (Europe/Paris), pas jusqu'à son début.
 */
describe('Salons CSE : lectures publiques et bascule à venir/passé', () => {
  let payload: Payload
  let organizer: Organizer
  const createdIds: number[] = []

  const SUFFIX = 'int-test-events'
  const DAY_MS = 24 * 60 * 60 * 1000

  const createEvent = async (data: {
    title: string
    slug: string
    startDate: Date
    endDate: Date
    published: boolean
  }) => {
    const doc = await payload.create({
      collection: 'events',
      context: { disableRevalidate: true },
      data: {
        title: data.title,
        slug: data.slug,
        organizer: organizer.id,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        city: 'Paris',
        venue: 'Lieu de test',
        region: 'ile-de-france',
        published: data.published,
      },
    })
    createdIds.push(doc.id)
    return doc
  }

  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    organizer = await payload.create({
      collection: 'organizers',
      data: { name: `Organisateur ${SUFFIX}`, slug: `organisateur-${SUFFIX}` },
    })

    const today = startOfTodayParis()

    await createEvent({
      title: 'Salon à venir',
      slug: `a-venir-${SUFFIX}`,
      startDate: new Date(today.getTime() + 10 * DAY_MS),
      endDate: new Date(today.getTime() + 11 * DAY_MS),
      published: true,
    })

    // Cas limite : un salon dont la dernière journée est celle d'aujourd'hui
    // doit encore apparaître comme à venir (§ 8 : "jusqu'à la fin de sa
    // dernière journée, pas jusqu'à son début").
    await createEvent({
      title: 'Salon du jour',
      slug: `aujourd-hui-${SUFFIX}`,
      startDate: new Date(today.getTime() - 1 * DAY_MS),
      endDate: today,
      published: true,
    })

    await createEvent({
      title: 'Salon passé',
      slug: `passe-${SUFFIX}`,
      startDate: new Date(today.getTime() - 5 * DAY_MS),
      endDate: new Date(today.getTime() - 1 * DAY_MS),
      published: true,
    })

    await createEvent({
      title: 'Salon non publié',
      slug: `brouillon-${SUFFIX}`,
      startDate: new Date(today.getTime() + 20 * DAY_MS),
      endDate: new Date(today.getTime() + 21 * DAY_MS),
      published: false,
    })
  })

  afterAll(async () => {
    if (createdIds.length > 0) {
      await payload.delete({
        collection: 'events',
        where: { id: { in: createdIds } },
        context: { disableRevalidate: true },
      })
    }
    await payload.delete({ collection: 'organizers', where: { id: { equals: organizer.id } } })
  })

  it('classe un salon qui se termine aujourd’hui comme à venir, pas comme passé', async () => {
    const upcoming = await getUpcomingEvents({ limit: 50 })
    const past = await getPastEvents({ limit: 50 })

    expect(upcoming.map((event) => event.slug)).toContain(`aujourd-hui-${SUFFIX}`)
    expect(past.docs.map((event) => event.slug)).not.toContain(`aujourd-hui-${SUFFIX}`)
  })

  it('ne retient que les salons publiés et à venir, triés du plus proche au plus lointain', async () => {
    const upcoming = await getUpcomingEvents({ limit: 50 })
    const slugs = upcoming.map((event) => event.slug)

    expect(slugs).toContain(`a-venir-${SUFFIX}`)
    expect(slugs).not.toContain(`passe-${SUFFIX}`)
    expect(slugs).not.toContain(`brouillon-${SUFFIX}`)

    const starts = upcoming.map((event) => event.startDate ?? '')
    expect([...starts]).toEqual([...starts].sort())
  })

  it('classe les éditions passées de la plus récente à la plus ancienne', async () => {
    const past = await getPastEvents({ limit: 50 })
    const starts = past.docs.map((event) => event.startDate ?? '')

    expect(starts).toContain(
      past.docs.find((event) => event.slug === `passe-${SUFFIX}`)?.startDate,
    )
    expect([...starts]).toEqual([...starts].sort().reverse())
  })

  it('renvoie null pour le slug d’un salon non publié', async () => {
    await expect(getEventBySlug(`brouillon-${SUFFIX}`)).resolves.toBeNull()
  })

  it('retrouve une fiche publiée par son slug', async () => {
    const event = await getEventBySlug(`a-venir-${SUFFIX}`)
    expect(event?.title).toBe('Salon à venir')
  })

  it('getNextEvent renvoie le salon à venir le plus proche', async () => {
    const next = await getNextEvent()
    expect(next?.slug).toBe(`aujourd-hui-${SUFFIX}`)
  })

  it('ne propose au filtre que les organisateurs ayant un salon à venir publié', async () => {
    const organizers = await getOrganizersWithEventCount()
    const mine = organizers.find((item) => item.value === `organisateur-${SUFFIX}`)

    // Deux salons à venir publiés pour cet organisateur : « à venir » et « du jour ».
    expect(mine?.count).toBe(2)
  })
})
