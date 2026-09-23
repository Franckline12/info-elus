import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'

import Container from '@/components/Container'
import { legalNavItems, navItems, siteDescription, siteName, siteTagline } from '@/lib/site'
import { colors, fonts, ruleOnDeep } from '@/theme/tokens'

const linkStyles = {
  color: colors.paper,
  fontSize: '0.9375rem',
  '&:hover': { color: colors.bluePale },
}

/** Pied de page sur fond bleu profond (§ 5.1), filets clairs, aucun arrondi. */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        bgcolor: colors.blueDeep,
        color: colors.paper,
        // Sur fond sombre, l'anneau de focus bleu vif manquerait de contraste.
        '& :focus-visible': { outlineColor: colors.paper },
      }}
    >
      <Container sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography
              component="p"
              sx={{
                fontSize: 'clamp(1.5rem, 1.2rem + 1vw, 2rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                m: 0,
              }}
            >
              {siteName}
            </Typography>
            <Typography
              component="p"
              sx={{
                mt: 1,
                fontFamily: fonts.serif,
                fontStyle: 'italic',
                color: colors.bluePale,
                m: 0,
                mb: 2,
              }}
            >
              {siteTagline}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.bluePale, maxWidth: '40ch' }}>
              {siteDescription}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography
              component="h2"
              variant="overline"
              sx={{ display: 'block', color: colors.bluePale, mb: 1.5 }}
            >
              Rubriques
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1 }}>
              {navItems.map((item) => (
                <li key={item.href}>
                  <AppLink href={item.href} sx={linkStyles}>
                    {item.label}
                  </AppLink>
                </li>
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography
              component="h2"
              variant="overline"
              sx={{ display: 'block', color: colors.bluePale, mb: 1.5 }}
            >
              Informations
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1 }}>
              {legalNavItems.map((item) => (
                <li key={item.href}>
                  <AppLink href={item.href} sx={linkStyles}>
                    {item.label}
                  </AppLink>
                </li>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 4, md: 5 }, borderColor: ruleOnDeep }} />

        <Typography variant="body2" sx={{ color: colors.bluePale }}>
          © {year} {siteName} — média indépendant d’information à destination des élus de Comité
          Social et Économique.
        </Typography>
      </Container>
    </Box>
  )
}

export default Footer
