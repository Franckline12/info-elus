/**
 * Jetons de design partagés entre le thème MUI (module `'use client'`) et les
 * composants serveur. Ils vivent dans un module neutre : un `'use client'`
 * transformerait ces constantes en références client, inutilisables côté serveur.
 * Source : cahier des charges § 5.1 et § 5.2, complété par la maquette de référence.
 */

export const colors = {
  paper: '#F3F0E6',
  paperRaised: '#FBFAF4',
  /** Fond de page : blanc, sur demande du client (remplace le papier crème par défaut). */
  pageBackground: '#FFFFFF',
  ink: '#10152B',
  textSecondary: '#565C78',
  blueDeep: '#12193B',
  blueMid: '#24356F',
  blueBright: '#3E63E0',
  bluePale: '#E4E9FB',
  /**
   * Unique accent hors-bleu, strictement réservé à la rubrique Jeux & Quiz
   * (§ 5.3) : bandeau de rubrique, vignettes, parcours de quiz. Partout
   * ailleurs — appels à l'action, badges, citations — l'accent est bleu.
   */
  accentQuiz: '#E3A23E',
  /** Teinte très diluée de l'ocre : fonds des surfaces de Jeux & Quiz. */
  sandPale: '#FAF2E2',
} as const

/** Filets fins : encre très diluée, lisible sur papier comme sur papier surélevé. */
export const rule = 'rgba(16, 21, 43, 0.22)'

/** Bordure des surfaces (cartes, encarts) : plus discrète encore que les filets. */
export const surfaceBorder = 'rgba(16, 21, 43, 0.12)'

/** Filets fins sur les fonds bleu profond (hero, footer). */
export const ruleOnDeep = 'rgba(243, 240, 230, 0.28)'

export const fonts = {
  /** Space Grotesk, en attendant Roc Grotesk (§ 5.2). */
  sans: "var(--font-sans), 'Space Grotesk', system-ui, -apple-system, sans-serif",
  serif: "var(--font-serif), 'Source Serif 4', Georgia, 'Times New Roman', serif",
} as const

/**
 * Rayon unique des surfaces. La maquette adoucit très légèrement les cartes
 * (4 px) sans jamais basculer dans la carte SaaS arrondie ; les filets, le
 * masthead et les séparateurs restent à angles droits.
 */
export const radius = 20

/**
 * Élévation au survol des vignettes de listing (articles, guides) : ombre
 * d'encre très diluée et léger décalage, jamais de halo coloré. C'est la seule
 * entorse au « pas d'ombre » du § 5.1, réservée à l'état de survol.
 */
export const hoverShadow = 'rgba(16, 21, 43, 0.14)'

/** Survol commun des vignettes cliquables : élévation neutre, bordure filet. */
export const cardHoverSx = {
  transition: 'box-shadow 160ms ease, transform 160ms ease, border-color 160ms ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    borderColor: rule,
    boxShadow: `0 6px 18px ${hoverShadow}`,
  },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
    '&:hover': { transform: 'none' },
  },
}

/** Longueur de ligne confortable pour le corps de texte (~70 caractères). */
export const measure = '68ch'
