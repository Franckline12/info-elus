import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import ArticleMeta from '@/components/ArticleMeta'
import Breadcrumb from '@/components/Breadcrumb'
import CategoryLabel from '@/components/CategoryLabel'
import Container from '@/components/Container'
import JsonLd from '@/components/JsonLd'
import MediaImage from '@/components/MediaImage'
import RichText from '@/components/RichText'
import TagList from '@/components/TagList'
import type { TagListItem } from '@/components/TagList'
import { toDateTimeAttribute } from '@/lib/formatDate'
import { absoluteUrl, siteName } from '@/lib/site'
import { articlePath, categoryPath, listingLabel, listingPath } from '@/lib/routes'
import type { Article, Category, Media, Tag } from '@/payload-types'
import { measure } from '@/theme/tokens'

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
 * Gabarit commun aux articles de fond et aux actualités : seuls le fil d'Ariane,
 * l'URL et le type JSON-LD changent d'un type à l'autre.
 */
export function ArticleDetail({ article, related }: Props) {
  const category = asCategory(article.category)
  const tags = asTags(article.tags)
  const image = asMedia(article.featuredImage)
  const url = absoluteUrl(articlePath(article))

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
    <Container sx={{ py: { xs: 3, md: 5 } }}>
      <JsonLd data={jsonLd} />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: listingLabel(article.type), href: listingPath(article.type) },
          { label: article.title },
        ]}
      />

      <Box component="article" sx={{ mt: { xs: 3, md: 4 } }}>
        <Box component="header" sx={{ maxWidth: measure }}>
          {category ? (
            <Box sx={{ mb: 1.5 }}>
              <CategoryLabel
                name={category.name}
                href={category.slug ? categoryPath(article.type, category.slug) : undefined}
              />
            </Box>
          ) : null}

          <Typography variant="h1" component="h1" sx={{ mb: 3 }}>
            {article.title}
          </Typography>

          <Typography variant="lede" component="p" sx={{ color: 'text.secondary', mb: 3 }}>
            {article.excerpt}
          </Typography>

          <ArticleMeta
            publishedAt={article.publishedAt}
            updatedAt={article.updatedAt}
            readingTime={article.readingTime}
          />
        </Box>

        {image ? (
          <Box component="figure" sx={{ my: { xs: 4, md: 5 }, mx: 0 }}>
            <MediaImage
              media={image}
              ratio={2 / 1}
              sizes="(max-width: 1200px) 100vw, 1152px"
              priority
            />
          </Box>
        ) : (
          <Divider sx={{ my: { xs: 4, md: 5 } }} />
        )}

        <RichText data={article.content} />

        {tags.length > 0 ? (
          <Box sx={{ mt: 5, maxWidth: measure }}>
            <TagList tags={tags} />
          </Box>
        ) : null}

        <Divider sx={{ my: 4 }} />

        <ShareLinks url={url} title={article.title} />
      </Box>

      <RelatedArticles articles={related} />
    </Container>
  )
}

export default ArticleDetail
