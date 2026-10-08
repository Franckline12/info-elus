import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import ArticleMeta from '@/components/ArticleMeta'
import Breadcrumb from '@/components/Breadcrumb'
import CategoryLabel from '@/components/CategoryLabel'
import Container from '@/components/Container'
import JsonLd from '@/components/JsonLd'
import MediaImage from '@/components/MediaImage'
import NewsletterBlock from '@/components/NewsletterBlock'
import RichText from '@/components/RichText'
import TagList from '@/components/TagList'
import type { TagListItem } from '@/components/TagList'
import { toDateTimeAttribute } from '@/lib/formatDate'
import { absoluteUrl, siteName } from '@/lib/site'
import { articlePath, categoryPath, listingLabel, listingPath, tagPath } from '@/lib/routes'
import { extractToc } from '@/lib/toc'
import type { Article, Category, Media, Tag } from '@/payload-types'
import { radius } from '@/theme/tokens'

import ArticleToc from './ArticleToc'
import RelatedArticles from './RelatedArticles'
import ShareLinks from './ShareLinks'

type Props = {
  article: Article
  related: Article[]
}

const asCategory = (value: Article['category']): Category | null =>
  value && typeof value === 'object' ? value : null

const asTags = (value: Article['tags']): TagListItem[] =>
  (value ?? []).filter((tag): tag is Tag => typeof tag === 'object' && tag !== null)

const asMedia = (value: Media | number | null | undefined): Media | null =>
  value && typeof value === 'object' ? value : null

/**
 * Gabarit commun aux articles de fond et aux actualités : image d'ouverture,
 * colonne de lecture et colonne latérale (sommaire), comme sur la maquette.
 * Seuls le fil d'Ariane, l'URL et le type JSON-LD changent d'un type à l'autre.
 */
export function ArticleDetail({ article, related }: Props) {
  const category = asCategory(article.category)
  const tags = asTags(article.tags)
  const image = asMedia(article.featuredImage)
  const url = absoluteUrl(articlePath(article))
  const toc = extractToc(article.content)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': article.type === 'news' ? 'NewsArticle' : 'Article',
    headline: article.title,
    description: article.excerpt,
    ...(image?.url ? { image: [absoluteUrl(image.url)] } : {}),
    ...(article.publishedAt ? { datePublished: toDateTimeAttribute(article.publishedAt) } : {}),
    dateModified: toDateTimeAttribute(article.updatedAt),
    ...(category ? { articleSection: category.name } : {}),
    ...(tags.length > 0 ? { keywords: tags.map((tag) => tag.name).join(', ') } : {}),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: siteName, url: absoluteUrl('/') },
    publisher: { '@type': 'Organization', name: siteName, url: absoluteUrl('/') },
  }

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <JsonLd data={jsonLd} />

      {image ? (
        <Box
          component="figure"
          sx={{ m: 0, mb: { xs: 2.5, md: 3 }, borderRadius: `${radius}px`, overflow: 'hidden' }}
        >
          <MediaImage
            media={image}
            ratio={3 / 1}
            sizes="(max-width: 1200px) 100vw, 1152px"
            priority
          />
        </Box>
      ) : null}

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: listingLabel(article.type), href: listingPath(article.type) },
          ...(category
            ? [
                {
                  label: category.name,
                  href: category.slug ? categoryPath(article.type, category.slug) : undefined,
                },
              ]
            : []),
          { label: article.title },
        ]}
      />

      <Grid container spacing={{ xs: 3, md: 5 }} sx={{ mt: { xs: 0, md: 0.5 } }}>
        {/* Sans sommaire (article sans titres de section), la colonne de lecture
            occupe toute la largeur plutôt que de laisser un vide à droite. */}
        <Grid size={{ xs: 12, md: toc.length > 0 ? 8 : 12 }}>
          <Box component="article">
            <Box component="header">
              {category ? (
                <Box sx={{ mb: 2 }}>
                  <CategoryLabel
                    name={category.name}
                    href={category.slug ? categoryPath(article.type, category.slug) : undefined}
                    tone="sand"
                  />
                </Box>
              ) : null}

              <Typography
                variant="h1"
                component="h1"
                sx={{ fontSize: 'clamp(1.75rem, 1.3rem + 1.8vw, 2.5rem)', mb: 2 }}
              >
                {article.title}
              </Typography>

              <Typography variant="lede" component="p" sx={{ color: 'text.secondary', mb: 2 }}>
                {article.excerpt}
              </Typography>

              <ArticleMeta
                publishedAt={article.publishedAt}
                updatedAt={article.updatedAt}
                readingTime={article.readingTime}
                variant="compact"
              />
            </Box>

            <Divider sx={{ my: { xs: 3, md: 4 } }} />

            <RichText data={article.content} />

            {tags.length > 0 ? (
              <Box sx={{ mt: 5 }}>
                <TagList tags={tags} hrefFor={(tag) => tagPath(article.type, tag.slug ?? '')} />
              </Box>
            ) : null}

            <Divider sx={{ my: 4 }} />

            <ShareLinks url={url} title={article.title} />
          </Box>
        </Grid>

        {toc.length > 0 ? (
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
              <ArticleToc entries={toc} />
            </Box>
          </Grid>
        ) : null}
      </Grid>

      <RelatedArticles articles={related} />

      {/* Inscription à la lettre hebdomadaire en bas de contenu (§ 2.6). */}
      <Box sx={{ mt: { xs: 5, md: 7 } }}>
        <NewsletterBlock source={articlePath(article)} />
      </Box>
    </Container>
  )
}

export default ArticleDetail
