import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'
import Container from '@/components/Container'
import { navItems } from '@/lib/site'
import { rule } from '@/theme/tokens'

export const metadata = {
  title: 'Page introuvable',
}

/** Page 404 du front public, aux couleurs du site. */
export default function NotFound() {
  return (
    <Container sx={{ py: { xs: 8, md: 12 } }}>
      <Typography
        component="p"
        variant="overline"
        sx={{ display: 'block', color: 'text.secondary', mb: 2 }}
      >
        Erreur 404
      </Typography>

      <Typography variant="h1" component="h1" sx={{ mb: 3, maxWidth: '16ch' }}>
        Cette page n’existe pas
      </Typography>

      <Typography variant="lede" component="p" sx={{ color: 'text.secondary', maxWidth: '52ch' }}>
        Le contenu a peut-être été déplacé, ou l’adresse comporte une erreur.
      </Typography>

      <Box
        component="nav"
        aria-label="Rubriques du site"
        sx={{ mt: 5, pt: 3, borderTop: `1px solid ${rule}` }}
      >
        <Box
          component="ul"
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, listStyle: 'none', m: 0, p: 0 }}
        >
          <li>
            <AppLink href="/" sx={{ fontWeight: 500 }}>
              Accueil
            </AppLink>
          </li>
          {navItems.map((item) => (
            <li key={item.href}>
              <AppLink href={item.href} sx={{ fontWeight: 500 }}>
                {item.label}
              </AppLink>
            </li>
          ))}
        </Box>
      </Box>
    </Container>
  )
}
