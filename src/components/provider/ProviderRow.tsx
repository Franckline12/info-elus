import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'

import AppLink from '@/components/AppLink'
import CategoryLabel from '@/components/CategoryLabel'
import { interventionAreaLabel } from '@/lib/interventionAreas'
import { providerCategoryLabel } from '@/lib/providerCategories'
import { providerPath } from '@/lib/routes'
import type { Provider } from '@/payload-types'
import { colors } from '@/theme/tokens'

import ProviderLogo from './ProviderLogo'

type Props = {
  provider: Provider
}

/**
 * Une ligne de l'annuaire (§ 2.4).
 *
 * Traitement éditorial du § 5.3 : les fiches sont séparées par des filets, pas
 * enfermées dans des cartes arrondies à ombre. Le survol se contente d'un
 * changement de fond, sans élévation.
 *
 * Toute la ligne est cliquable par le titre ; la mention « Voir la fiche »
 * pointe vers la même URL et reste un repère visuel, masquée aux lecteurs
 * d'écran pour ne pas annoncer deux fois le même lien.
 */
export function ProviderRow({ provider }: Props) {
  const href = providerPath(provider)
  const areas = provider.interventionAreas ?? []

  return (
    <Box
      component="article"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'auto 1fr', sm: 'auto 1fr auto' },
        columnGap: { xs: 2, sm: 3 },
        rowGap: 1,
        alignItems: { xs: 'start', sm: 'center' },
        py: { xs: 2.5, md: 3 },
        px: { xs: 0, md: 1 },
        transition: 'background-color 160ms ease',
        '&:hover': { backgroundColor: colors.paperRaised },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      <ProviderLogo provider={provider} size={72} />

      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.75 }}>
          <Typography variant="h4" component="h3" sx={{ fontSize: '1.0625rem', m: 0 }}>
            <AppLink href={href} underline="hover" sx={{ color: 'text.primary' }}>
              {provider.name}
            </AppLink>
          </Typography>

          <CategoryLabel name={providerCategoryLabel(provider.category)} />
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: '62ch', m: 0 }}>
          {provider.shortDescription}
        </Typography>

        {areas.length > 0 ? (
          <Typography
            component="p"
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 0.5,
              mt: 1,
              mb: 0,
              fontSize: '0.8125rem',
              color: 'text.secondary',
            }}
          >
            <PlaceOutlinedIcon aria-hidden sx={{ fontSize: '0.95em', opacity: 0.8 }} />
            <Box component="span">
              <Box component="span" sx={{ fontWeight: 500 }}>
                Zone d’intervention :{' '}
              </Box>
              {areas.map(interventionAreaLabel).join(', ')}
            </Box>
          </Typography>
        ) : null}
      </Box>

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
    </Box>
  )
}

export default ProviderRow
