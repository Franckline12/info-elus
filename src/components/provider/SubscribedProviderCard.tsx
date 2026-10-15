import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import StarBorderIcon from '@mui/icons-material/StarBorder'

import AppLink from '@/components/AppLink'
import CategoryLabel from '@/components/CategoryLabel'
import { interventionAreaLabel } from '@/lib/interventionAreas'
import { providerCategory } from '@/lib/providerCategories'
import { providerPath } from '@/lib/routes'
import type { Provider } from '@/payload-types'
import { colors, fonts, radius } from '@/theme/tokens'

import ProviderLogo from './ProviderLogo'

type Props = {
  provider: Provider
}

/**
 * Carte grand format pour un prestataire abonné (mise en avant payante).
 *
 * Conserve la même disposition que la rangée standard (photo/logo à gauche,
 * textes et informations à droite) mais dans des proportions agrandies,
 * avec un encadrement distinctif et un badge « Prestataire ».
 */
export function SubscribedProviderCard({ provider }: Props) {
  const href = providerPath(provider)
  // Catégorie supprimée après coup : la carte reste affichée, sans badge.
  const category = providerCategory(provider.category)
  const areas = provider.interventionAreas ?? []

  return (
    <Box
      component="article"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr', md: 'auto 1fr auto' },
        columnGap: { xs: 2.5, sm: 3.5, md: 4 },
        rowGap: 2,
        alignItems: { xs: 'start', md: 'center' },
        p: { xs: 2.5, sm: 3, md: 3.5 },
        backgroundColor: colors.paperRaised,

        borderRadius: `${radius}px`,
      }}
    >
      {/* Photo / Logo agrandi à gauche */}
      <Box sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
        <ProviderLogo provider={provider} size={104} />
      </Box>

      {/* Informations à droite */}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25, mb: 1 }}>
          {/* Badge abonné distinctif */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.25,
              py: 0.25,
              backgroundColor: colors.accentQuiz,
              color: colors.ink,
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Prestataire
            <StarBorderIcon aria-hidden sx={{ fontSize: '0.95rem' }} />
          </Box>

          {category ? <CategoryLabel name={category.name} /> : null}
        </Box>

        {/* Titre agrandi */}
        <Typography
          variant="h3"
          component="h3"
          sx={{
            fontFamily: fonts.sans,
            fontSize: { xs: '1.25rem', md: '1.45rem' },
            fontWeight: 700,
            lineHeight: 1.25,
            m: 0,
            mb: 0.75,
          }}
        >
          <AppLink href={href} underline="hover" sx={{ color: 'text.primary' }}>
            {provider.name}
          </AppLink>
        </Typography>

        {/* Description agrandie */}
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontSize: { xs: '0.9375rem', md: '1rem' },
            lineHeight: 1.55,
            maxWidth: '68ch',
            m: 0,
            mb: 1.25,
          }}
        >
          {provider.shortDescription}
        </Typography>

        {/* Zones d'intervention */}
        {areas.length > 0 ? (
          <Typography
            component="p"
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 0.5,
              m: 0,
              fontSize: '0.875rem',
              color: 'text.secondary',
            }}
          >
            <PlaceOutlinedIcon aria-hidden sx={{ fontSize: '1.05em', opacity: 0.8 }} />
            <Box component="span">
              <Box component="span" sx={{ fontWeight: 600 }}>
                Zone d’intervention :{' '}
              </Box>
              {areas.map(interventionAreaLabel).join(', ')}
            </Box>
          </Typography>
        ) : null}
      </Box>

      {/* Bouton d'action à droite */}
      <Box sx={{ alignSelf: { xs: 'stretch', md: 'center' }, mt: { xs: 1, md: 0 } }}>
        <Button
          component={AppLink}
          href={href}
          variant="contained"
          color="accentQuiz"
          endIcon={<ArrowForwardIcon />}
          sx={{
            fontWeight: 700,
            color: colors.ink,
            px: { xs: 2.5, md: 3 },
            py: 1.25,
            whiteSpace: 'nowrap',
            width: { xs: '100%', md: 'auto' },
          }}
        >
          Voir la fiche
        </Button>
      </Box>
    </Box>
  )
}

export default SubscribedProviderCard
