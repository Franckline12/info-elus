import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'

import AppLink from '@/components/AppLink'
import CategoryLabel from '@/components/CategoryLabel'
import VisuallyHidden from '@/components/VisuallyHidden'
import { eventOrganizer } from '@/lib/organizers'
import { eventOrganizerPath, eventPath } from '@/lib/routes'
import type { Event } from '@/payload-types'
import { colors, radius, surfaceBorder } from '@/theme/tokens'

import EventDateBadge from './EventDateBadge'

type Props = {
  event: Event
  /** Édition passée : pas de lien d'inscription, mention « Terminé ». */
  past?: boolean
}

/**
 * Style de la liste des cartes `EventRow` : deux colonnes à partir de la
 * tablette, pour éviter le grand vide central d'une carte en pleine largeur.
 */
export const eventListSx = {
  listStyle: 'none',
  m: 0,
  p: 0,
  display: 'grid',
  // Une seule colonne jusqu'à `lg` : en dessous, une carte est trop étroite
  // pour garder la date, le contenu et le bouton d'inscription sur une ligne.
  gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
  gap: { xs: 1.5, md: 2 },
} as const

/**
 * Une ligne de la liste des salons (§ 8) : carte bordée, sur le modèle de la
 * maquette de référence (date mise en avant, bouton d'inscription en pilule).
 */
export function EventRow({ event, past = false }: Props) {
  const href = eventPath(event)
  const organizer = eventOrganizer(event.organizer)

  return (
    <Box
      component="article"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'auto 1fr', sm: 'auto 1fr auto' },
        columnGap: { xs: 2, sm: 3 },
        rowGap: 1.5,
        alignItems: { xs: 'start', sm: 'center' },
        p: { xs: 2, md: 2.5 },
        border: `1px solid ${surfaceBorder}`,
        borderRadius: `${radius}px`,
        backgroundColor: colors.paperRaised,
        opacity: past ? 0.8 : 1,
        transition: 'border-color 160ms ease',
        '&:hover': { borderColor: colors.blueBright },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      <EventDateBadge startDate={event.startDate} endDate={event.endDate} />

      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.75 }}>
          <Typography variant="h4" component="h3" sx={{ fontSize: '1.0625rem', m: 0 }}>
            <AppLink href={href} underline="hover" sx={{ color: 'text.primary' }}>
              {event.title}
            </AppLink>
          </Typography>

          {past ? (
            <Chip
              label="Terminé"
              size="small"
              sx={{ backgroundColor: colors.paper, color: colors.textSecondary }}
            />
          ) : null}

          <Chip
            label={event.isFree ? 'Gratuit' : 'Accès payant'}
            size="small"
            sx={
              event.isFree
                ? { backgroundColor: colors.bluePale, color: colors.blueMid }
                : { backgroundColor: colors.paper, color: colors.textSecondary }
            }
          />

          {/* Le badge organisateur est un `Chip` (un `<div>`) : il ne peut pas
              vivre dans le `<p>` du `Typography` ci-dessous sans provoquer une
              erreur d'hydratation (imbrication invalide). */}
          {organizer ? (
            <CategoryLabel name={organizer.name} href={eventOrganizerPath(organizer.slug ?? '')} />
          ) : null}
        </Box>

        <Typography
          variant="body2"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', m: 0 }}
        >
          <LocationOnOutlinedIcon aria-hidden sx={{ fontSize: '0.95em', opacity: 0.8 }} />
          {event.city} — {event.venue}
        </Typography>

        {typeof event.exhibitorCount === 'number' ? (
          <Typography
            component="p"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 1,
              mb: 0,
              fontSize: '0.8125rem',
              color: 'text.secondary',
            }}
          >
            <GroupsOutlinedIcon aria-hidden sx={{ fontSize: '0.95em', opacity: 0.8 }} />
            {event.exhibitorCount} exposants
          </Typography>
        ) : null}
      </Box>

      {!past && event.registrationUrl ? (
        <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
          <AppLink
            href={event.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              flexShrink: 0,
              px: 1.75,
              py: 0.875,
              border: `1px solid ${colors.blueBright}`,
              borderRadius: `${radius}px`,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: colors.blueBright,
              transition: 'background-color 160ms ease, color 160ms ease',
              '&:hover': { backgroundColor: colors.blueBright, color: '#FFFFFF' },
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
          >
            <CalendarMonthOutlinedIcon aria-hidden sx={{ fontSize: '1.05em' }} />
            S’inscrire
            <ChevronRightIcon aria-hidden sx={{ fontSize: '1.05em' }} />
            <VisuallyHidden>(site externe, s’ouvre dans un nouvel onglet)</VisuallyHidden>
          </AppLink>
        </Box>
      ) : (
        <Box
          aria-hidden
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 0.5,
            flexShrink: 0,
            fontSize: '0.875rem',
            fontWeight: 500,
            color: colors.blueBright,
          }}
        >
          Voir la fiche
          <ArrowForwardIcon sx={{ fontSize: '1em' }} />
        </Box>
      )}
    </Box>
  )
}

export default EventRow
