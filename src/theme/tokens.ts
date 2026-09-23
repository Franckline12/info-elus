/**
 * Jetons de design partagés entre le thème MUI (module `'use client'`) et les
 * composants serveur. Ils vivent dans un module neutre : un `'use client'`
 * transformerait ces constantes en références client, inutilisables côté serveur.
 * Source : cahier des charges § 5.1 et § 5.2.
 */

export const colors = {
  paper: '#F3F0E6',
  paperRaised: '#FBFAF4',
  ink: '#10152B',
  textSecondary: '#565C78',
  blueDeep: '#12193B',
  blueMid: '#24356F',
  blueBright: '#3E63E0',
  bluePale: '#E4E9FB',
  /** Réservé exclusivement à la section Jeux & Quiz (§ 5.3). */
  accentQuiz: '#E3A23E',
} as const

/** Filets fins : encre très diluée, lisible sur papier comme sur papier surélevé. */
export const rule = 'rgba(16, 21, 43, 0.22)'

/** Filets fins sur les fonds bleu profond (footer). */
export const ruleOnDeep = 'rgba(243, 240, 230, 0.28)'

export const fonts = {
  /** Space Grotesk, en attendant Roc Grotesk (§ 5.2). */
  sans: "var(--font-sans), 'Space Grotesk', system-ui, -apple-system, sans-serif",
  serif: "var(--font-serif), 'Source Serif 4', Georgia, 'Times New Roman', serif",
} as const

/** Longueur de ligne confortable pour le corps de texte (~70 caractères). */
export const measure = '68ch'
