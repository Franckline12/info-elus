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
  icon?: SectionIcon
}

/** Clé d'icône résolue côté composant : ce module reste sans dépendance MUI. */
export type SectionIcon = 'news' | 'articles' | 'guides' | 'quiz' | 'providers' | 'events'

export type SectionShortcut = NavItem & {
  description: string
  icon: SectionIcon
}

/** Arborescence du cahier des charges § 3. */
export const navItems: NavItem[] = [
  { label: 'Actualité', href: '/actualite', icon: 'news' },
  { label: 'Articles', href: '/articles', icon: 'articles' },
  { label: 'Guides', href: '/guides', icon: 'guides' },
  { label: 'Jeux & Quiz', href: '/jeux-quiz', icon: 'quiz' },
  { label: 'Prestataires', href: '/prestataires', icon: 'providers' },
  { label: 'Salons', href: '/salons', icon: 'events' },
]

export const legalNavItems: NavItem[] = [
  { label: 'À propos', href: '/a-propos' },
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Confidentialité', href: '/confidentialite' },
  { label: 'Contact', href: '/contact' },
]

/**
 * Les quatre accès aux grandes sections, sous le bandeau d'accueil. Ce sont des
 * éléments de navigation (et non du contenu éditorial) : ils sont donc définis
 * ici plutôt que lus dans le CMS.
 */
export const sectionShortcuts: SectionShortcut[] = [
  {
    label: 'Articles',
    href: '/articles',
    description: 'Toute l’actualité juridique et pratique du CSE',
    icon: 'articles',
  },
  {
    label: 'Guides CSE',
    href: '/guides',
    description: 'Des fiches pratiques pour aller à l’essentiel',
    icon: 'guides',
  },
  {
    label: 'Jeux & Quiz',
    href: '/jeux-quiz',
    description: 'Testez vos connaissances de façon ludique',
    icon: 'quiz',
  },
  {
    label: 'Réseau de prestataires',
    href: '/prestataires',
    description: 'Trouvez les bons partenaires pour vous accompagner',
    icon: 'providers',
  },
]

export type SocialLink = {
  label: string
  href: string
  network: 'linkedin' | 'x' | 'youtube'
}

/**
 * Comptes sociaux du pied de page (maquette). Les URL des comptes Infos Élus
 * n'ont pas encore été fournies : ces liens pointent pour l'instant vers la page
 * d'accueil de chaque réseau et sont à remplacer par les vrais profils.
 * Vider la liste masque entièrement le bloc.
 */
export const socialLinks: SocialLink[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/', network: 'linkedin' },
  { label: 'X', href: 'https://x.com/', network: 'x' },
  { label: 'YouTube', href: 'https://www.youtube.com/', network: 'youtube' },
]
