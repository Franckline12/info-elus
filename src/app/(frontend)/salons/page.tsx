import type { Metadata } from 'next'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'

import AppLink from '@/components/AppLink'
import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import EventFilterPanel from '@/components/event/EventFilterPanel'
import EventRow, { eventListSx } from '@/components/event/EventRow'
import PageHero from '@/components/PageHero'
import PaginationLinks from '@/components/PaginationLinks'
import SectionHeading from '@/components/SectionHeading'
import { groupEventsByMonth } from '@/lib/events'
import { eventRegionValue } from '@/lib/interventionAreas'
import {
  getEventRegionsWithCount,
  getOrganizersWithEventCount,
  getPastEvents,
  getUpcomingEvents,
} from '@/lib/queries/events'
import { getOrganizers } from '@/lib/queries/organizers'
import { eventsPagePath, eventsPath, parsePage } from '@/lib/routes'
import { radius, rule, surfaceBorder } from '@/theme/tokens'

const PAST_PER_PAGE = 10
/** Au-delà de ce nombre, les régions restantes se replient sous « +N » (maquette § 8). */
const REGION_FILTERS_VISIBLE = 5

const DESCRIPTION =
  'Les salons professionnels destinés aux élus de CSE et aux représentants du personnel : dates, ' +
  'lieux et informations pratiques, pour préparer un déplacement.'

const INTRO =
  'Cette rubrique recense les salons organisés pour les comités, à l’exclusion des webinaires et ' +
  'des congrès syndicaux. Les dates et les lieux sont ceux communiqués par les organisateurs : ' +
  'vérifiez-les avant de vous déplacer, notamment pour une édition annoncée plusieurs mois à l’avance.'

type Props = {
  searchParams: Promise<{ organisateur?: string; region?: string; page?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parsePage((await searchParams).page)

  return {
    title: page > 1 ? `Salons CSE — éditions passées, page ${page}` : 'Salons CSE',
    description: DESCRIPTION,
    alternates: { canonical: eventsPath },
  }
}

export default async function EventsPage({ searchParams }: Props) {
  const params = await searchParams

  // Comme pour l'annuaire des prestataires : un slug d'organisateur inconnu
  // retombe sur « tous », plutôt que de renvoyer une liste vide qui se lirait
  // comme une absence de salon.
  const organizers = await getOrganizers()
  const activeOrganizer = params.organisateur
    ? organizers.find((organizer) => organizer.slug === params.organisateur)
    : undefined
  const organizerSlug = activeOrganizer?.slug ?? undefined
  const region = eventRegionValue(params.region)
  const page = parsePage(params.page)

  const [upcoming, organizerCounts, regionCounts, past] = await Promise.all([
    getUpcomingEvents({ organizerSlug, region, limit: 100 }),
    // Chaque famille de filtres se compte sans elle-même, l'autre filtre
    // restant actif : une option annonce ce qu'elle donnerait si on la choisissait.
    getOrganizersWithEventCount({ region }),
    getEventRegionsWithCount({ organizerSlug }),
    getPastEvents({ page, limit: PAST_PER_PAGE }),
  ])

  const groups = groupEventsByMonth(upcoming)
  const filtered = Boolean(organizerSlug || region)

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <PageHero title="Salons CSE" description={DESCRIPTION} />

      <Typography
        variant="lede"
        component="p"
        sx={{ mt: { xs: 2.5, md: 3 }, maxWidth: '68ch', color: 'text.secondary' }}
      >
        {INTRO}
      </Typography>

      <Box sx={{ mt: { xs: 3, md: 4 } }}>
        <EventFilterPanel
          groups={[
            {
              label: 'Organisateurs',
              items: [
                {
                  key: 'all',
                  label: 'Tous les organisateurs',
                  href: eventsPagePath({ region }),
                  active: !organizerSlug,
                },
                ...organizerCounts.map((organizer) => ({
                  key: organizer.value,
                  label: `${organizer.label} (${organizer.count ?? 0})`,
                  href: eventsPagePath({ organizerSlug: organizer.value, region }),
                  active: organizer.value === organizerSlug,
                })),
              ],
            },
            {
              label: 'Régions',
              items: [
                {
                  key: 'all',
                  label: 'Toutes les régions',
                  href: eventsPagePath({ organizerSlug }),
                  active: !region,
                },
                ...regionCounts.map((item) => ({
                  key: item.value,
                  label: `${item.label} (${item.count ?? 0})`,
                  href: eventsPagePath({ organizerSlug, region: item.value }),
                  active: item.value === region,
                })),
              ],
              maxVisible: REGION_FILTERS_VISIBLE,
            },
          ]}
        />
      </Box>

      <Box component="section" aria-labelledby="prochains-salons" sx={{ mt: { xs: 4, md: 5 } }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            justifyContent: 'space-between',
            gap: 2,
            mb: { xs: 2, md: 2.5 },
          }}
        >
          <Box>
            <Typography
              id="prochains-salons"
              component="h2"
              variant="h3"
              sx={{ fontSize: { xs: '1.25rem', md: '1.375rem' }, letterSpacing: '-0.01em', m: 0 }}
            >
              Prochains salons
            </Typography>

            <Typography
              component="p"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 0.5,
                mb: 0,
                fontSize: '0.875rem',
                color: 'text.secondary',
              }}
            >
              <CalendarMonthOutlinedIcon aria-hidden sx={{ fontSize: '1.05em' }} />
              {upcoming.length} résultat{upcoming.length > 1 ? 's' : ''}
            </Typography>
          </Box>

          {upcoming.length > 0 ? (
            <Box
              aria-hidden
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                flexShrink: 0,
                px: 1.5,
                py: 0.875,
                border: `1px solid ${surfaceBorder}`,
                borderRadius: `${radius}px`,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.secondary',
              }}
            >
              <CalendarMonthOutlinedIcon aria-hidden sx={{ fontSize: '1.05em' }} />
              Triés par date (du plus proche)
            </Box>
          ) : null}
        </Box>

        {upcoming.length === 0 ? (
          <EmptyState
            title="Aucun salon à venir"
            description={
              filtered
                ? 'Aucun salon à venir ne correspond à ce filtre.'
                : 'Les prochaines dates seront ajoutées dès que les organisateurs les publient.'
            }
          />
        ) : (
          groups.map((group) => (
            <Box key={group.label} sx={{ mt: { xs: 3, md: 3.5 }, '&:first-of-type': { mt: 0 } }}>
              <Typography
                component="h3"
                variant="overline"
                sx={{ display: 'block', color: 'text.secondary', mb: 1 }}
              >
                {group.label}
              </Typography>

              <Box component="ul" sx={eventListSx}>
                {group.events.map((event) => (
                  <Box component="li" key={event.id}>
                    <EventRow event={event} />
                  </Box>
                ))}
              </Box>
            </Box>
          ))
        )}

        {filtered ? (
          <Box sx={{ mt: { xs: 2, md: 2.5 } }}>
            <AppLink href={eventsPath} sx={{ fontSize: '0.875rem' }}>
              Réinitialiser les filtres
            </AppLink>
          </Box>
        ) : null}
      </Box>

      <Box
        component="section"
        aria-labelledby="editions-passees"
        sx={{ mt: { xs: 5, md: 6 }, pt: { xs: 2, md: 2.5 }, borderTop: `1px solid ${rule}` }}
      >
        <SectionHeading id="editions-passees" title="Éditions passées" />

        {past.docs.length === 0 ? (
          page > 1 ? (
            <EmptyState
              title="Cette page est vide"
              description="Revenez à la première page pour retrouver les éditions passées."
            />
          ) : (
            <EmptyState
              title="Aucune édition passée"
              description="Les salons basculent ici automatiquement une fois leur dernière journée terminée."
            />
          )
        ) : (
          <Box component="ul" sx={eventListSx}>
            {past.docs.map((event) => (
              <Box component="li" key={event.id}>
                <EventRow event={event} past />
              </Box>
            ))}
          </Box>
        )}

        <PaginationLinks
          basePath={eventsPath}
          page={past.page ?? 1}
          totalPages={past.totalPages}
          params={{ organisateur: organizerSlug, region }}
        />
      </Box>

      {/*
        Mention éditoriale : à faire valider par le client (sur le modèle de
        celle de l'annuaire des prestataires).
      */}
      <Typography
        component="p"
        sx={{
          mt: { xs: 5, md: 6 },
          pt: { xs: 2, md: 2.5 },
          borderTop: `1px solid ${rule}`,
          maxWidth: '68ch',
          fontSize: '0.8125rem',
          color: 'text.secondary',
        }}
      >
        Infos Élus n’organise pas ces salons : les informations sont données à titre indicatif.
        Vérifiez les dates et le lieu auprès de l’organisateur avant de vous déplacer.
      </Typography>
    </Container>
  )
}
