import { Source_Serif_4, Space_Grotesk } from 'next/font/google'

/**
 * Polices chargées par `next/font` (auto-hébergées, sans requête vers Google) et
 * exposées en variables CSS consommées par le thème via `fonts` (src/theme/tokens.ts).
 */

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '700'],
})

export const sourceSerif = Source_Serif_4({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  weight: ['400', '600'],
})

export const fontVariables = `${spaceGrotesk.variable} ${sourceSerif.variable}`
