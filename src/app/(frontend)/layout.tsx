import type { Metadata, Viewport } from 'next'
import React from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import SkipLink from '@/components/SkipLink'
import { siteDescription, siteName, siteTagline, siteUrl } from '@/lib/site'
import { fontVariables } from '@/theme/fonts'
import theme from '@/theme/theme'
import { colors } from '@/theme/tokens'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — ${siteTagline}`,
    template: `%s — ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    siteName,
    locale: 'fr_FR',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: colors.pageBackground,
}

/**
 * Racine du front public uniquement. L'admin Payload possède sa propre racine
 * dans `src/app/(payload)/layout.tsx` : aucun style MUI ne l'atteint.
 *
 * `AppRouterCacheProvider` fait émettre les styles Emotion pendant le rendu
 * serveur ; sans lui la page s'affiche brièvement non stylée au chargement.
 */
export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={fontVariables}>
      <body>
        <AppRouterCacheProvider options={{ key: 'mui' }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <SkipLink />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
              <Header />
              <Box component="main" id="contenu" sx={{ flexGrow: 1 }}>
                {children}
              </Box>
              <Footer />
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
