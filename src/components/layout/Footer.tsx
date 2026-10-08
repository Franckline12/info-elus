import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'
import Container from '@/components/Container'
import NewsletterForm from '@/components/NewsletterForm'
import { legalNavItems, siteName, siteTagline } from '@/lib/site'
import { colors, fonts, ruleOnDeep } from '@/theme/tokens'

import SocialLinks from './SocialLinks'

/**
 * Pied de page sur fond bleu profond : logotype signé et inscription à la
 * lettre hebdomadaire sur la première rangée, liens et réseaux sociaux sur la
 * seconde, séparées par un filet fin (§ 5.3).
 *
 * Le formulaire y est présent sur toutes les pages (§ 2.6) : c'est la version
 * compacte, sans cadre ni illustration, celle du bloc large restant réservée à
 * l'accueil et au bas des contenus.
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
            alignItems: { xs: 'stretch', md: 'flex-start' },
            justifyContent: 'space-between',
            gap: { xs: 3.5, md: 6 },
            pb: { xs: 3.5, md: 3.5 },
            borderBottom: `1px solid ${ruleOnDeep}`,
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

          <Box
            component="section"
            aria-labelledby="newsletter-pied"
            sx={{ width: { md: 380 }, flexShrink: 0 }}
          >
            <Typography
              id="newsletter-pied"
              component="h2"
              sx={{ fontSize: '0.9375rem', fontWeight: 700, m: 0, mb: 1.25 }}
            >
              La lettre hebdomadaire
            </Typography>
            <NewsletterForm variant="compact" source="pied-de-page" />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 2.5, md: 4 },
            pt: { xs: 3, md: 3 },
          }}
        >
          <Box component="nav" aria-label="Liens de pied de page">
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

          <Box sx={{ ml: { md: 'auto' } }}>
            <SocialLinks />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
