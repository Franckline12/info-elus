import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'
import ArticleMeta from '@/components/ArticleMeta'
import CategoryLabel from '@/components/CategoryLabel'
import MediaImage from '@/components/MediaImage'
import { articlePath, categoryPath } from '@/lib/routes'
import type { Article, Category } from '@/payload-types'

type Props = {
  article: Article
  priority?: boolean
}

const asCategory = (value: Article['category']): Category | null =>
  value && typeof value === 'object' ? value : null

/** Grand format : l'article d'ouverture d'une page (§ 2.3). */
export function FeaturedArticle({ article, priority = true }: Props) {
  const category = asCategory(article.category)
  const href = articlePath(article)
  const hasImage = Boolean(article.featuredImage)

  return (
    <Box component="article">
      <Grid container spacing={{ xs: 2.5, md: 5 }} sx={{ alignItems: 'start' }}>
        {hasImage ? (
          <Grid size={{ xs: 12, md: 7 }}>
            <AppLink href={href} tabIndex={-1} aria-hidden sx={{ display: 'block' }}>
              <MediaImage
                media={article.featuredImage}
                ratio={3 / 2}
                sizes="(max-width: 900px) 100vw, 58vw"
                priority={priority}
              />
            </AppLink>
          </Grid>
        ) : null}

        <Grid size={{ xs: 12, md: hasImage ? 5 : 12 }}>
          {category ? (
            <Box sx={{ mb: 1.5 }}>
              <CategoryLabel
                name={category.name}
                href={category.slug ? categoryPath(article.type, category.slug) : undefined}
              />
            </Box>
          ) : null}

          <Typography variant="h2" component="h3" sx={{ mb: 2 }}>
            <AppLink href={href} underline="none" sx={{ color: 'text.primary' }}>
              {article.title}
            </AppLink>
          </Typography>

          <Typography variant="lede" component="p" sx={{ color: 'text.secondary', mb: 2.5 }}>
            {article.excerpt}
          </Typography>

          <ArticleMeta publishedAt={article.publishedAt} readingTime={article.readingTime} />
        </Grid>
      </Grid>
    </Box>
  )
}

export default FeaturedArticle
