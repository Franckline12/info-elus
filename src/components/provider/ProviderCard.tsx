import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'

import AppLink from '@/components/AppLink'
import MediaImage from '@/components/MediaImage'
import { providerPath } from '@/lib/routes'
import { providerCategoryLabel } from '@/lib/providerCategories'
import type { Provider } from '@/payload-types'
import { colors, surfaceBorder } from '@/theme/tokens'

type Props = {
  provider: Provider
}

/** Ligne d'annuaire de la maquette : logo, description, zone, lien vers la fiche. */
export function ProviderCard({ provider }: Props) {
  const href = providerPath(provider)

  return (
    <Card
      component="article"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '96px 1fr auto' },
        alignItems: 'center',
        gap: { xs: 2, sm: 3 },
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          width: 96,
          height: 72,
          border: `1px solid ${surfaceBorder}`,
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        {provider.logo ? (
          <MediaImage media={provider.logo} sizes="96px" ratio={4 / 3} />
        ) : (
          <Typography component="span" sx={{ fontWeight: 700, color: colors.blueMid }}>
            {provider.name.slice(0, 2).toUpperCase()}
          </Typography>
        )}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.75 }}>
          <Typography variant="h4" component="h3" sx={{ fontSize: '1rem', m: 0 }}>
            <AppLink href={href} underline="none" sx={{ color: 'text.primary' }}>
              {provider.name}
            </AppLink>
          </Typography>
          <Chip label={providerCategoryLabel(provider.category)} size="small" />
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: provider.area ? 0.75 : 0 }}>
          {provider.description}
        </Typography>

        {provider.area ? (
          <Typography
            component="p"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.8125rem',
              color: 'text.secondary',
              m: 0,
            }}
          >
            <PlaceOutlinedIcon aria-hidden sx={{ fontSize: '0.95em', opacity: 0.8 }} />
            {provider.area}
          </Typography>
        ) : null}
      </Box>

      <Button
        component={AppLink}
        href={href}
        variant="outlined"
        size="small"
        underline="none"
        endIcon={<ArrowForwardIcon />}
        sx={{ justifySelf: { xs: 'start', sm: 'end' }, color: 'primary.main' }}
      >
        Voir la fiche
      </Button>
    </Card>
  )
}

export default ProviderCard
