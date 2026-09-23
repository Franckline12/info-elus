import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'
import Container from '@/components/Container'
import { legalNavItems, siteName, siteTagline } from '@/lib/site'
import { colors, fonts } from '@/theme/tokens'

import SocialLinks from './SocialLinks'

/**
 * Pied de page de la maquette : une seule rangée sur fond bleu profond —
 * logotype signé à gauche, liens au centre, réseaux sociaux à droite.
 */
export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 6, md: 8 },
        bgcolor: colors.blueDeep,
        color: colors.paper,
        // Sur fond sombre, l'anneau de focus bleu vif manquerait de contraste.
        '& :focus-visible': { outlineColor: colors.paper },
      }}
    >
      <Container sx={{ py: { xs: 4, md: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 3, md: 4 },
          }}
        >
          <Box>
            <Typography
              component="p"
              sx={{
                fontSize: { xs: '1.375rem', md: '1.5rem' },
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                m: 0,
              }}
            >
              {siteName}
            </Typography>
            <Typography
              component="p"
              sx={{
                m: 0,
                mt: 0.25,
                fontFamily: fonts.serif,
                fontStyle: 'italic',
                fontSize: '0.8125rem',
                color: colors.bluePale,
              }}
            >
              {siteTagline}
            </Typography>
          </Box>

          <Box component="nav" aria-label="Liens de pied de page" sx={{ ml: { md: 'auto' } }}>
            <Box
              component="ul"
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: { xs: 2, md: 3.5 },
                listStyle: 'none',
                m: 0,
                p: 0,
              }}
            >
              {legalNavItems.map((item) => (
                <li key={item.href}>
                  <AppLink
                    href={item.href}
                    underline="none"
                    sx={{
                      color: colors.paper,
                      fontSize: '0.875rem',
                      '&:hover': { color: colors.bluePale, textDecoration: 'underline' },
                    }}
                  >
                    {item.label}
                  </AppLink>
                </li>
              ))}
            </Box>
          </Box>

          <Box sx={{ ml: { md: 3 } }}>
            <SocialLinks />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
