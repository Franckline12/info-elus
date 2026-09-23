import type { Metadata } from 'next'

import { absoluteUrl, siteName } from '@/lib/site'
import type { Article, Guide, Media } from '@/payload-types'

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
 * Contenu éditorial doté des champs du plugin SEO. Articles et guides partagent
 * la même forme, au résumé près : chapô (`excerpt`) pour les premiers, résumé
 * court (`summary`) pour les seconds.
 */
type SeoContent = Pick<Article | Guide, 'title' | 'featuredImage' | 'updatedAt'> & {
  excerpt?: string | null
  summary?: string | null
  meta?: Article['meta']
  publishedAt?: string | null
}

/**
 * Métadonnées d'une page de contenu : champs SEO du CMS en priorité, repli sur
 * `title`, le résumé et `featuredImage` (§ 4.3).
 */
export function contentMetadata(article: SeoContent, path: string): Metadata {
  const title = stripSiteSuffix(article.meta?.title || article.title)
  const description = article.meta?.description || article.excerpt || article.summary || undefined
  const image = asMedia(article.meta?.image) ?? asMedia(article.featuredImage)
  const url = absoluteUrl(path)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      siteName,
      locale: 'fr_FR',
      ...(article.publishedAt ? { publishedTime: article.publishedAt } : {}),
      modifiedTime: article.updatedAt,
      ...(image?.url
        ? {
            images: [
              {
                url: absoluteUrl(image.url),
                width: image.width ?? undefined,
                height: image.height ?? undefined,
                alt: image.alt,
              },
            ],
          }
        : {}),
    },
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
