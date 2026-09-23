import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'
import ArticleMeta from '@/components/ArticleMeta'
import CategoryLabel from '@/components/CategoryLabel'
import MediaImage from '@/components/MediaImage'
import { articlePath, categoryPath } from '@/lib/routes'
import type { Article, Category } from '@/payload-types'

type Props = {
  article: Article
  showExcerpt?: boolean
}

const asCategory = (value: Article['category']): Category | null =>
  value && typeof value === 'object' ? value : null

/** Entrée de fil chronologique : vignette étroite à gauche, texte à droite. */
export function ArticleListItem({ article, showExcerpt = true }: Props) {
  const category = asCategory(article.category)
  const href = articlePath(article)

  return (
    <Box
      component="article"
      sx={{
        display: 'grid',
        gridTemplateColumns: article.featuredImage ? { xs: '1fr', sm: '180px 1fr' } : '1fr',
        gap: { xs: 2, sm: 3 },
        alignItems: 'start',
      }}
    >
      {article.featuredImage ? (
        <AppLink href={href} tabIndex={-1} aria-hidden sx={{ display: 'block' }}>
          <MediaImage
            media={article.featuredImage}
            ratio={4 / 3}
            sizes="(max-width: 600px) 100vw, 180px"
          />
        </AppLink>
      ) : null}

      <Box>
        {category ? (
          <Box sx={{ mb: 0.75 }}>
            <CategoryLabel
              name={category.name}
              href={category.slug ? categoryPath(article.type, category.slug) : undefined}
            />
          </Box>
        ) : null}

        <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
          <AppLink href={href} underline="none" sx={{ color: 'text.primary' }}>
            {article.title}
          </AppLink>
        </Typography>

        {showExcerpt ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            {article.excerpt}
          </Typography>
        ) : null}

        <ArticleMeta publishedAt={article.publishedAt} readingTime={article.readingTime} />
      </Box>
    </Box>
  )
}

export default ArticleListItem
