import type { Payload } from 'payload'

import type { Event } from '../payload-types'
import { p, richText, type RichTextContent } from './lexical'
import { ensureOrganizers } from './taxonomies'

/**
 * Salons CSE de démonstration (rubrique Salons, § 8). Les treize premières
 * entrées sont des salons réels, vérifiés le 15 octobre 2026 auprès des pages
 * des organisateurs. Les deux dernières (« marseille-automne-2026 » et
 * « toulouse-automne-2026 ») sont fictives : elles n'existent dans aucune
 * liste fournie, et servent uniquement à peupler la section « éditions
 * passées » pour pouvoir tester le basculement automatique à venir → passé.
 *
 * Script rejouable : les salons portant ces slugs sont supprimés avant d'être
 * recréés, comme pour les autres seeds.
 */

type SeedEvent = {
  slug: string
  title: string
  organizerSlug: string
  startDate: string
  endDate: string
  city: string
  venue: string
  address?: string
  region: NonNullable<Event['region']>
  registrationUrl?: string
  isFree?: boolean
  exhibitorCount?: number
  hasConferences?: boolean
  description: RichTextContent
  published?: boolean
}

const LAST_VERIFIED_AT = '2026-10-15'

const EVENTS: SeedEvent[] = [
  {
    slug: 'salon-cse-parc-asterix-2026',
    title: 'Salon CSE Parc Astérix',
    organizerSlug: 'solutionscse',
    startDate: '2026-11-03',
    endDate: '2026-11-03',
    city: 'Plailly',
    venue: 'Parc Astérix',
    region: 'hauts-de-france',
    registrationUrl: 'https://www.solutions-cse.org',
    isFree: true,
    exhibitorCount: 110,
    hasConferences: true,
    description: richText(
      p(
        'Salon professionnel réservé aux élus de CSE et aux représentants du personnel, avec une centaine d’exposants autour de la formation, des activités sociales et culturelles et des outils de gestion du comité.',
      ),
      p('Entrée gratuite sur inscription, programme de conférences sur la journée.'),
    ),
    published: true,
  },
  {
    slug: 'solutions-cse-lyon-2027',
    title: 'Solutions CSE Lyon',
    organizerSlug: 'solutionscse',
    startDate: '2027-03-10',
    endDate: '2027-03-11',
    city: 'Lyon',
    venue: 'Centre des Congrès de Lyon',
    region: 'auvergne-rhone-alpes',
    registrationUrl: 'https://www.solutions-cse.org',
    isFree: true,
    exhibitorCount: 200,
    hasConferences: true,
    description: richText(
      p(
        'Deux journées réservées aux élus de CSE de la région lyonnaise, avec deux cents exposants et un programme de conférences sur les grands sujets du mandat.',
      ),
    ),
    published: true,
  },
  {
    slug: 'solutions-cse-toulouse-2027',
    title: 'Solutions CSE Toulouse',
    organizerSlug: 'solutionscse',
    startDate: '2027-03-17',
    endDate: '2027-03-18',
    city: 'Toulouse',
    venue: 'MEETT',
    region: 'occitanie',
    registrationUrl: 'https://www.solutions-cse.org',
    isFree: true,
    exhibitorCount: 150,
    hasConferences: true,
    description: richText(
      p(
        'Édition toulousaine du salon, cent cinquante exposants et un programme de conférences destiné aux élus du Sud-Ouest.',
      ),
    ),
    published: true,
  },
  {
    slug: 'solutions-cse-paris-2027',
    title: 'Solutions CSE Paris',
    organizerSlug: 'solutionscse',
    startDate: '2027-03-24',
    endDate: '2027-03-25',
    city: 'Paris',
    venue: 'Parc des Princes',
    region: 'ile-de-france',
    registrationUrl: 'https://www.solutions-cse.org',
    isFree: true,
    exhibitorCount: 350,
    hasConferences: true,
    description: richText(
      p(
        'La plus grande édition du salon, trois cent cinquante exposants au Parc des Princes et un programme de conférences sur deux jours.',
      ),
    ),
    published: true,
  },
  {
    slug: 'solutions-cse-rennes-2027',
    title: 'Solutions CSE Rennes',
    organizerSlug: 'solutionscse',
    startDate: '2027-04-06',
    endDate: '2027-04-07',
    city: 'Rennes',
    venue: 'Couvent des Jacobins',
    region: 'bretagne',
    registrationUrl: 'https://www.solutions-cse.org',
    isFree: true,
    exhibitorCount: 120,
    hasConferences: true,
    description: richText(
      p('Édition bretonne du salon, cent vingt exposants au Couvent des Jacobins de Rennes.'),
    ),
    published: true,
  },
  {
    slug: 'le-salon-cse-rennes-2027',
    title: 'Le Salon CSE Rennes',
    organizerSlug: 'eluceo',
    startDate: '2027-03-16',
    endDate: '2027-03-17',
    city: 'Rennes',
    venue: 'Roazhon Park',
    region: 'bretagne',
    registrationUrl: 'https://www.eluceo.fr',
    isFree: true,
    hasConferences: true,
    description: richText(
      p(
        'Salon réservé aux élus de CSE et représentants du personnel, au stade Roazhon Park de Rennes.',
      ),
    ),
    published: true,
  },
  {
    slug: 'le-salon-cse-le-havre-2027',
    title: 'Le Salon CSE Le Havre',
    organizerSlug: 'eluceo',
    startDate: '2027-03-18',
    endDate: '2027-03-18',
    city: 'Le Havre',
    venue: 'Stade Océane',
    region: 'normandie',
    registrationUrl: 'https://www.eluceo.fr',
    isFree: true,
    hasConferences: true,
    description: richText(
      p('Salon d’une journée au Stade Océane du Havre, réservé aux élus de CSE.'),
    ),
    published: true,
  },
  {
    slug: 'le-salon-cse-marseille-2027',
    title: 'Le Salon CSE Marseille',
    organizerSlug: 'eluceo',
    startDate: '2027-03-25',
    endDate: '2027-03-26',
    city: 'Marseille',
    venue: 'CEPAC Vélodrome',
    region: 'provence-alpes-cote-d-azur',
    registrationUrl: 'https://www.eluceo.fr',
    isFree: true,
    hasConferences: true,
    description: richText(
      p('Édition marseillaise du salon, au CEPAC Vélodrome, sur deux journées.'),
    ),
    published: true,
  },
  {
    slug: 'le-salon-cse-lille-2027',
    title: 'Le Salon CSE Lille',
    organizerSlug: 'eluceo',
    startDate: '2027-03-30',
    endDate: '2027-03-31',
    city: 'Villeneuve-d’Ascq',
    venue: 'Decathlon Arena',
    region: 'hauts-de-france',
    registrationUrl: 'https://www.eluceo.fr',
    isFree: true,
    hasConferences: true,
    description: richText(
      p('Salon de la métropole lilloise, à la Decathlon Arena de Villeneuve-d’Ascq.'),
    ),
    published: true,
  },
  {
    slug: 'le-salon-cse-lyon-2027',
    title: 'Le Salon CSE Lyon',
    organizerSlug: 'eluceo',
    startDate: '2027-04-06',
    endDate: '2027-04-07',
    city: 'Décines-Charpieu',
    venue: 'Groupama Stadium',
    region: 'auvergne-rhone-alpes',
    registrationUrl: 'https://www.eluceo.fr',
    isFree: true,
    hasConferences: true,
    description: richText(p('Édition lyonnaise du salon, au Groupama Stadium de Décines-Charpieu.')),
    published: true,
  },
  {
    slug: 'le-salon-cse-reims-2027',
    title: 'Le Salon CSE Reims',
    organizerSlug: 'eluceo',
    startDate: '2027-04-08',
    endDate: '2027-04-09',
    city: 'Reims',
    venue: 'Stade Auguste-Delaune',
    region: 'grand-est',
    registrationUrl: 'https://www.eluceo.fr',
    isFree: true,
    hasConferences: true,
    description: richText(p('Édition rémoise du salon, au stade Auguste-Delaune.')),
    published: true,
  },
  {
    slug: 'le-salon-cse-nantes-2027',
    title: 'Le Salon CSE Nantes',
    organizerSlug: 'eluceo',
    startDate: '2027-04-13',
    endDate: '2027-04-14',
    city: 'Nantes',
    venue: 'H Arena',
    region: 'pays-de-la-loire',
    registrationUrl: 'https://www.eluceo.fr',
    isFree: true,
    hasConferences: true,
    description: richText(p('Édition nantaise du salon, à la H Arena.')),
    published: true,
  },
  {
    slug: 'le-salon-cse-dijon-2027',
    title: 'Le Salon CSE Dijon',
    organizerSlug: 'eluceo',
    startDate: '2027-05-11',
    endDate: '2027-05-11',
    city: 'Dijon',
    venue: 'Stade Gaston-Gérard',
    region: 'bourgogne-franche-comte',
    registrationUrl: 'https://www.eluceo.fr',
    isFree: true,
    hasConferences: true,
    description: richText(p('Salon d’une journée au stade Gaston-Gérard de Dijon.')),
    published: true,
  },
  // — Éditions fictives (automne 2026), pour tester la section « éditions passées ».
  {
    slug: 'le-salon-cse-toulouse-automne-2026',
    title: 'Le Salon CSE Toulouse',
    organizerSlug: 'eluceo',
    startDate: '2026-09-29',
    endDate: '2026-09-29',
    city: 'Toulouse',
    venue: 'Stadium de Toulouse',
    region: 'occitanie',
    registrationUrl: 'https://www.eluceo.fr',
    isFree: true,
    hasConferences: true,
    description: richText(p('Salon d’une journée au Stadium de Toulouse.')),
    published: true,
  },
  {
    slug: 'solutions-cse-marseille-automne-2026',
    title: 'Solutions CSE Marseille',
    organizerSlug: 'solutionscse',
    startDate: '2026-10-06',
    endDate: '2026-10-07',
    city: 'Marseille',
    venue: 'Orange Vélodrome',
    region: 'provence-alpes-cote-d-azur',
    registrationUrl: 'https://www.solutions-cse.org',
    isFree: true,
    exhibitorCount: 130,
    hasConferences: true,
    description: richText(
      p('Édition marseillaise du salon, cent trente exposants à l’Orange Vélodrome.'),
    ),
    published: true,
  },
]

export async function seedEvents(payload: Payload): Promise<void> {
  const organizers = await ensureOrganizers(payload)
  const slugs = EVENTS.map((event) => event.slug)

  const { docs: existing } = await payload.find({
    collection: 'events',
    where: { slug: { in: slugs } },
    limit: slugs.length,
    depth: 0,
  })

  if (existing.length > 0) {
    await payload.delete({
      collection: 'events',
      where: { slug: { in: slugs } },
      context: { disableRevalidate: true },
    })
    payload.logger.info(`${existing.length} salon(s) de démonstration remplacé(s)`)
  }

  for (const event of EVENTS) {
    const organizerId = organizers.get(event.organizerSlug)
    if (!organizerId) throw new Error(`Organisateur introuvable pour « ${event.title} »`)

    await payload.create({
      collection: 'events',
      context: { disableRevalidate: true },
      data: {
        title: event.title,
        slug: event.slug,
        organizer: organizerId,
        startDate: event.startDate,
        endDate: event.endDate,
        city: event.city,
        venue: event.venue,
        address: event.address,
        region: event.region,
        registrationUrl: event.registrationUrl,
        isFree: event.isFree ?? true,
        exhibitorCount: event.exhibitorCount,
        hasConferences: event.hasConferences ?? false,
        description: event.description,
        lastVerifiedAt: LAST_VERIFIED_AT,
        published: event.published ?? false,
      },
    })
  }

  payload.logger.info(`${EVENTS.length} salons de démonstration créés`)
}
