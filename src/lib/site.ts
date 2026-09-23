/** Constantes éditoriales du site, partagées entre le header, le footer et le SEO. */

export const siteName = 'Infos Élus'
export const siteTagline = 'Le média des élus du CSE'
export const siteDescription =
  'Articles juridiques, actualité, guides et outils pratiques pour les élus de CSE.'

/**
 * URL publique du site, utilisée pour les métadonnées Open Graph et les données
 * structurées JSON-LD (qui exigent des URL absolues).
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
)

export const absoluteUrl = (path: string): string =>
  path.startsWith('http') ? path : `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`

export type NavItem = {
  label: string
  href: string
}

/** Arborescence du cahier des charges § 3. */
export const navItems: NavItem[] = [
  { label: 'Actualité', href: '/actualite' },
  { label: 'Articles', href: '/articles' },
  { label: 'Guides', href: '/guides' },
  { label: 'Jeux & Quiz', href: '/jeux-quiz' },
  { label: 'Prestataires', href: '/prestataires' },
]

export const legalNavItems: NavItem[] = [
  { label: 'À propos', href: '/a-propos' },
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Confidentialité', href: '/confidentialite' },
]
