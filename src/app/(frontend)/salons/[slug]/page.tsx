import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import AppLink from '@/components/AppLink'
import Breadcrumb from '@/components/Breadcrumb'
import CategoryLabel from '@/components/CategoryLabel'
import Container from '@/components/Container'
import EventPastNotice from '@/components/event/EventPastNotice'
import EventPracticalInfo from '@/components/event/EventPracticalInfo'
import EventRow from '@/components/event/EventRow'
import JsonLd from '@/components/JsonLd'
import MediaImage from '@/components/MediaImage'
import RichText from '@/components/RichText'
import SectionHeading from '@/components/SectionHeading'
import VisuallyHidden from '@/components/VisuallyHidden'
import { formatDateRange, formatLongDate } from '@/lib/formatDate'
import { isPastEvent, eventSeoDescription } from '@/lib/events'
import { interventionAreaLabel } from '@/lib/interventionAreas'
import { eventOrganizer } from '@/lib/organizers'
import {
  getEventBySlug,
  getPublishedEventSlugs,
  getRelatedEvents,
} from '@/lib/queries/events'
import { eventOrganizerPath, eventPath, eventsPath } from '@/lib/routes'
import { contentMetadata } from '@/lib/seo'
import { absoluteUrl } from '@/lib/site'
import type { Media } from '@/payload-types'
import { rule } from '@/theme/tokens'

/** SSG au build, puis régénération à la demande (le hook de l'admin) — et au
 * plus tard une heure après, pour qu'un salon dont la dernière journée vient
 * de se terminer bascule seul en « édition passée » sans qu'on republie rien
 * (§ 8 : la particularité de cette rubrique). */
export const revalidate = 3600

export const dynamicParams = true

type Props = {
  params: Promise<{ slug: string }>
}

const asMedia = (value: Media | number | null | undefined): Media | null =>
  value && typeof value === 'object' ? value : null

export async function generateStaticParams() {
  const slugs = await getPublishedEventSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) return { title: 'Page introuvable' }

  return contentMetadata(event, eventPath(event), 'website', eventSeoDescription(event))
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) notFound()

  const organizer = eventOrganizer(event.organizer)
  const past = isPastEvent(event)
  const featuredImage = asMedia(event.featuredImage)
  const url = absoluteUrl(eventPath(event))
  const regionLabel = event.region ? interventionAreaLabel(event.region) : undefined

  const related = organizer
    ? await getRelatedEvents({
        organizerId: organizer.id,
        region: event.region ?? '',
        excludeId: event.id,
      })
    : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        ...(event.address ? { streetAddress: event.address } : {}),
        addressLocality: event.city,
        ...(regionLabel ? { addressRegion: regionLabel } : {}),
        addressCountry: 'FR',
      },
    },
    ...(organizer
      ? {
          organizer: {
            '@type': 'Organization',
            name: organizer.name,
            ...(organizer.website ? { url: organizer.website } : {}),
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url: event.registrationUrl || url,
      availability: 'https://schema.org/InStock',
      ...(event.isFree ? { price: '0', priceCurrency: 'EUR' } : {}),
    },
    ...(featuredImage?.url ? { image: [absoluteUrl(featuredImage.url)] } : {}),
    description: eventSeoDescription(event),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }

  return (
    <Container width="narrow" sx={{ py: { xs: 3, md: 4 } }}>
      <JsonLd data={jsonLd} />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Salons CSE', href: eventsPath },
          { label: event.title },
        ]}
      />

      <Box component="article" sx={{ mt: { xs: 2.5, md: 3 } }}>
        {past ? <EventPastNotice /> : null}

        <Box component="header">
          {featuredImage ? (
            <Box sx={{ mb: { xs: 2, md: 2.5 } }}>
              <MediaImage
                media={featuredImage}
                ratio={16 / 7}
                sizes="(max-width: 844px) 90vw, 760px"
              />
            </Box>
          ) : null}

          {organizer ? (
            <Box sx={{ mb: 1 }}>
              <CategoryLabel name={organizer.name} href={eventOrganizerPath(organizer.slug ?? '')} />
            </Box>
          ) : null}

          <Typography
            variant="h1"
            component="h1"
            sx={{ fontSize: 'clamp(1.625rem, 1.25rem + 1.6vw, 2.25rem)', m: 0 }}
          >
            {event.title}
          </Typography>

          <Typography
            component="p"
            sx={{ mt: 1, fontSize: '1.25rem', fontWeight: 700, color: 'primary.main' }}
          >
            {formatDateRange(event.startDate, event.endDate)}
          </Typography>

          <Typography variant="lede" component="p" sx={{ mt: 1, color: 'text.secondary' }}>
            {event.venue}, {event.city}
          </Typography>

          {event.address ? (
            <Typography component="p" sx={{ mt: 0.5, fontSize: '0.9375rem', color: 'text.secondary' }}>
              {event.address}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ mt: { xs: 3, md: 4 } }}>
          <EventPracticalInfo event={event} id="infos-pratiques" />
        </Box>

        {!past && event.registrationUrl ? (
          <Box sx={{ mt: { xs: 2.5, md: 3 } }}>
            <Button
              component={AppLink}
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              color="primary"
              endIcon={<OpenInNewIcon aria-hidden />}
            >
              S’inscrire sur le site de l’organisateur
              <VisuallyHidden>(site externe, s’ouvre dans un nouvel onglet)</VisuallyHidden>
            </Button>
          </Box>
        ) : null}

        {event.description ? (
          <Box sx={{ mt: { xs: 3, md: 4 }, pt: { xs: 3, md: 4 }, borderTop: `1px solid ${rule}` }}>
            <Typography component="h2" variant="h3" sx={{ fontSize: '1.25rem', mb: 2 }}>
              Présentation
            </Typography>
            <RichText data={event.description} />
          </Box>
        ) : null}
      </Box>

      {related.length > 0 ? (
        <Box
          component="section"
          aria-labelledby="autres-salons"
          sx={{ mt: { xs: 4, md: 5 }, pt: { xs: 3, md: 4 }, borderTop: `1px solid ${rule}` }}
        >
          <SectionHeading id="autres-salons" title="Autres salons à venir" />

          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, borderTop: `1px solid ${rule}` }}>
            {related.map((item) => (
              <Box component="li" key={item.id} sx={{ borderBottom: `1px solid ${rule}` }}>
                <EventRow event={item} />
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}

      <Box sx={{ mt: { xs: 4, md: 5 }, pt: { xs: 2, md: 2.5 }, borderTop: `1px solid ${rule}` }}>
        <AppLink href={eventsPath} sx={{ fontSize: '0.9375rem' }}>
          Voir tous les salons
        </AppLink>
      </Box>

      {/*
        Mention éditoriale (§ 8) : à faire valider par le client, sur le
        modèle de celle de l'annuaire des prestataires.
      */}
      <Typography
        component="p"
        sx={{
          mt: { xs: 3, md: 4 },
          pt: { xs: 2, md: 2.5 },
          borderTop: `1px solid ${rule}`,
          maxWidth: '68ch',
          fontSize: '0.8125rem',
          color: 'text.secondary',
        }}
      >
        Infos Élus n’organise pas ce salon : les informations sont données à titre indicatif.
        Vérifiez les dates et le lieu auprès de l’organisateur avant de vous déplacer.
        {event.lastVerifiedAt ? ` Dates vérifiées le ${formatLongDate(event.lastVerifiedAt)}.` : ''}
      </Typography>
    </Container>
  )
}
