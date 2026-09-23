import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'

import Container from '@/components/Container'
import { navItems, siteName, siteTagline } from '@/lib/site'
import { fonts } from '@/theme/tokens'

import SiteNav from './SiteNav'

/**
 * Masthead de journal plutôt qu'une AppBar Material : pas de barre colorée, pas
 * d'ombre, juste un logotype, sa signature et deux filets encadrant la navigation.
 */
export function Header() {
  return (
    <Box component="header" sx={{ bgcolor: 'background.default' }}>
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'baseline' },
            justifyContent: 'space-between',
            gap: { xs: 0.5, sm: 3 },
            pt: { xs: 2.5, md: 4 },
            pb: { xs: 2, md: 3 },
          }}
        >
          <AppLink href="/" underline="none" sx={{ color: 'text.primary' }}>
            <Typography
              component="span"
              sx={{
                display: 'block',
                fontFamily: fonts.sans,
                fontSize: 'clamp(1.75rem, 1.1rem + 2.6vw, 3rem)',
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}
            >
              {siteName}
            </Typography>
          </AppLink>

          <Typography
            component="p"
            sx={{
              fontFamily: fonts.serif,
              fontStyle: 'italic',
              fontSize: { xs: '0.9375rem', md: '1.0625rem' },
              color: 'text.secondary',
              m: 0,
            }}
          >
            {siteTagline}
          </Typography>
        </Box>
      </Container>

      <Divider />

      <Container>
        <SiteNav items={navItems} />
      </Container>

      <Divider />
    </Box>
  )
}

export default Header
