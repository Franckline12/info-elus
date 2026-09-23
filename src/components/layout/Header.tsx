import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'
import Container from '@/components/Container'
import { navItems, siteName, siteTagline } from '@/lib/site'
import { colors, fonts, rule } from '@/theme/tokens'

import SiteNav from './SiteNav'

/**
 * Masthead de journal plutôt qu'une AppBar Material : une seule barre sur fond
 * papier surélevé, un logotype signé, la navigation et l'appel à l'action
 * newsletter, le tout fermé par un filet fin.
 */
export function Header() {
  return (
    <Box component="header" sx={{ bgcolor: colors.paperRaised, borderBottom: `1px solid ${rule}` }}>
      <Container>
        <SiteNav items={navItems}>
          <AppLink href="/" underline="none" sx={{ color: 'text.primary', flexShrink: 0 }}>
            <Typography
              component="span"
              sx={{
                display: 'block',
                fontFamily: fonts.sans,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}
            >
              {siteName}
            </Typography>
            <Typography
              component="span"
              sx={{
                display: 'block',
                fontSize: { xs: '0.6875rem', md: '0.75rem' },
                color: 'text.secondary',
                lineHeight: 1.2,
              }}
            >
              {siteTagline}
            </Typography>
          </AppLink>
        </SiteNav>
      </Container>
    </Box>
  )
}

export default Header
