import type { Metadata } from 'next'

import { absoluteUrl, siteName } from '@/lib/site'
import type { Article, Media } from '@/payload-types'

/**
 * Le plugin SEO génère des `meta.title` déjà suffixés « — Infos Élus », alors que
 * le `title.template` du layout ajoute ce même suffixe. On le retire ici pour
 * éviter « Titre — Infos Élus — Infos Élus ».
 */
const stripSiteSuffix = (title: string): string =>
  title.replace(new RegExp(`\\s*[—–-]\\s*${siteName}\\s*$`), '').trim()

const asMedia = (value: Media | number | null | undefined): Media | null =>
  value && typeof value === 'object' ? value : null

/**
 * Contenu doté des champs du plugin SEO. Chaque rubrique nomme son titre et son
 * résumé à sa façon — `title`/`excerpt` pour les articles, `title`/`summary`
 * pour les guides, `name`/`shortDescription` pour les prestataires — d'où ces
 * champs tous facultatifs, résolus par ordre de préférence.
 */
type SeoContent = {
  title?: string | null
  name?: string | null
  excerpt?: string | null
  summary?: string | null
  shortDescription?: string | null
  featuredImage?: Media | number | null
  /** Visuel de repli d'une fiche de l'annuaire, faute d'image mise en avant. */
  logo?: Media | number | null
  meta?: Article['meta']
  publishedAt?: string | null
  updatedAt: string
}

/**
 * `article` pour les contenus datés, `website` pour une fiche d'annuaire : les
 * deux formes Open Graph n'acceptent pas les mêmes attributs, d'où la
 * distinction plutôt qu'un simple paramètre recopié.
 */
export type OgType = 'article' | 'website'

/**
 * Métadonnées d'une page de contenu : champs SEO du CMS en priorité, repli sur
 * le titre, le résumé et l'image (§ 4.3).
 *
 * `fallbackDescription` : pour un contenu sans champ de résumé propre (les
 * salons, décrits par leur ville, leurs dates et leur lieu plutôt qu'un chapô)
 * — utilisé seulement si l'équipe éditoriale n'a rien saisi dans l'onglet SEO.
 */
export function contentMetadata(
  doc: SeoContent,
  path: string,
  ogType: OgType = 'article',
  fallbackDescription?: string,
): Metadata {
  const title = stripSiteSuffix(doc.meta?.title || doc.title || doc.name || '')
  const description =
    doc.meta?.description ||
    doc.excerpt ||
    doc.summary ||
    doc.shortDescription ||
    fallbackDescription ||
    undefined
  const image = asMedia(doc.meta?.image) ?? asMedia(doc.featuredImage) ?? asMedia(doc.logo)
  const url = absoluteUrl(path)

  const images = image?.url
    ? [
        {
          url: absoluteUrl(image.url),
          width: image.width ?? undefined,
          height: image.height ?? undefined,
          alt: image.alt,
        },
      ]
    : undefined

  const shared = { title, description, url, siteName, locale: 'fr_FR', images }

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph:
      ogType === 'article'
        ? {
            ...shared,
            type: 'article',
            ...(doc.publishedAt ? { publishedTime: doc.publishedAt } : {}),
            modifiedTime: doc.updatedAt,
          }
        : { ...shared, type: 'website' },
    twitter: {
      card: image?.url ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image?.url ? { images: [absoluteUrl(image.url)] } : {}),
    },
  }
}

/** Alias historique, conservé pour les pages d'article. */
export const articleMetadata = contentMetadata
