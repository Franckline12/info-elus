'use client'

import { createTheme } from '@mui/material/styles'
import type { PaletteColor, PaletteColorOptions } from '@mui/material/styles'
import type { CSSProperties } from 'react'

import { colors, fonts, rule } from './tokens'

declare module '@mui/material/styles' {
  interface Palette {
    blueDeep: PaletteColor
    bluePale: PaletteColor
    accentQuiz: PaletteColor
  }
  interface PaletteOptions {
    blueDeep?: PaletteColorOptions
    bluePale?: PaletteColorOptions
    accentQuiz?: PaletteColorOptions
  }
  /** Chapô éditorial en Source Serif 4 (cahier des charges § 5.2). */
  interface TypographyVariants {
    lede: CSSProperties
  }
  interface TypographyVariantsOptions {
    lede?: CSSProperties
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    lede: true
  }
}

/**
 * Thème du front public uniquement : il n'est monté que dans le groupe de routes
 * `(frontend)`, l'admin Payload conserve ses propres styles.
 *
 * Parti pris éditorial (§ 5.3) : aucun arrondi, aucune ombre, aucune élévation.
 * Ces règles sont posées ici une fois pour toutes plutôt que composant par composant.
 */
export const theme = createTheme({
  // Valeurs par défaut de MUI, reprises explicitement : elles correspondent aux
  // seuils mobile (600px) et tablette (900px) du cahier des charges.
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },

  palette: {
    mode: 'light',
    primary: {
      main: colors.blueBright,
      dark: colors.blueMid,
      light: colors.bluePale,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.blueMid,
      dark: colors.blueDeep,
      light: colors.blueBright,
      contrastText: '#FFFFFF',
    },
    background: {
      default: colors.paper,
      paper: colors.paperRaised,
    },
    text: {
      primary: colors.ink,
      secondary: colors.textSecondary,
    },
    divider: rule,
    blueDeep: {
      light: colors.blueMid,
      main: colors.blueDeep,
      dark: colors.blueDeep,
      contrastText: colors.paper,
    },
    bluePale: {
      light: colors.paperRaised,
      main: colors.bluePale,
      dark: colors.blueMid,
      contrastText: colors.ink,
    },
    accentQuiz: {
      light: '#F0C989',
      main: colors.accentQuiz,
      dark: '#B77C22',
      contrastText: colors.ink,
    },
  },

  shape: { borderRadius: 0 },

  // Traitement éditorial : jamais d'ombre portée, à aucun niveau d'élévation.
  shadows: Array.from({ length: 25 }, () => 'none') as unknown as ReturnType<
    typeof createTheme
  >['shadows'],

  // Anneau de focus clavier homogène sur tous les composants MUI (§ 4.5).
  focusVisible: {
    outlineStyle: 'solid',
    outlineWidth: '2px',
    outlineOffset: '2px',
    outlineColor: colors.blueBright,
  },

  typography: {
    fontFamily: fonts.sans,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontFamily: fonts.sans,
      fontSize: 'clamp(2rem, 1.35rem + 2.6vw, 3.25rem)',
      fontWeight: 700,
      lineHeight: 1.08,
      letterSpacing: '-0.022em',
    },
    h2: {
      fontFamily: fonts.sans,
      fontSize: 'clamp(1.5rem, 1.2rem + 1.2vw, 2.125rem)',
      fontWeight: 700,
      lineHeight: 1.15,
      letterSpacing: '-0.015em',
    },
    h3: {
      fontFamily: fonts.sans,
      fontSize: 'clamp(1.25rem, 1.1rem + 0.7vw, 1.5rem)',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: fonts.sans,
      fontSize: '1.125rem',
      fontWeight: 700,
      lineHeight: 1.35,
    },
    h5: { fontFamily: fonts.sans, fontSize: '1rem', fontWeight: 700, lineHeight: 1.4 },
    h6: { fontFamily: fonts.sans, fontSize: '0.9375rem', fontWeight: 700, lineHeight: 1.4 },
    body1: { fontSize: '1.0625rem', lineHeight: 1.7 },
    body2: { fontSize: '0.9375rem', lineHeight: 1.6 },
    lede: {
      fontFamily: fonts.serif,
      fontSize: 'clamp(1.125rem, 1.05rem + 0.35vw, 1.3125rem)',
      fontWeight: 400,
      lineHeight: 1.55,
      letterSpacing: '0.002em',
    },
    button: { fontFamily: fonts.sans, fontWeight: 500, textTransform: 'none' },
    caption: { fontSize: '0.8125rem', lineHeight: 1.45 },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: '0.09em',
      textTransform: 'uppercase',
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          colorScheme: 'light',
        },
        body: {
          backgroundColor: colors.paper,
          color: colors.ink,
        },
        // Focus clavier visible partout, y compris sur les éléments natifs
        // (liens, boutons, champs) : ne jamais le neutraliser (§ 4.5).
        ':focus-visible': {
          outline: `2px solid ${colors.blueBright}`,
          outlineOffset: '2px',
        },
        img: { maxWidth: '100%' },
        '::selection': { backgroundColor: colors.bluePale, color: colors.ink },
      },
    },

    // Blocs de contenu : bordure fine, pas d'ombre, pas d'élévation.
    MuiPaper: {
      defaultProps: { elevation: 0, variant: 'outlined' },
      styleOverrides: {
        root: { backgroundImage: 'none', borderRadius: 0 },
        outlined: { borderColor: rule },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0, variant: 'outlined' },
      styleOverrides: { root: { backgroundImage: 'none', borderRadius: 0 } },
    },

    MuiButtonBase: {
      // Registre éditorial : pas d'ondulation Material.
      defaultProps: { disableRipple: true },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: true },
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 0, boxShadow: 'none' },
        outlined: { borderColor: rule },
      },
    },

    MuiLink: {
      defaultProps: { underline: 'hover' },
      styleOverrides: { root: { textUnderlineOffset: '0.18em' } },
    },

    MuiDivider: { styleOverrides: { root: { borderColor: rule } } },

    MuiContainer: { defaultProps: { maxWidth: 'lg' } },

    MuiBreadcrumbs: {
      styleOverrides: {
        separator: { marginLeft: 6, marginRight: 6, color: colors.textSecondary },
      },
    },

    MuiPaginationItem: {
      styleOverrides: { root: { borderRadius: 0, fontWeight: 500 } },
    },
  },
})

export default theme
