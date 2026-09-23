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
  /** `true` pour les premières vignettes visibles : image chargée en priorité. */
  priority?: boolean
  showImage?: boolean
}

const asCategory = (value: Article['category']): Category | null =>
  value && typeof value === 'object' ? value : null

/** Vignette de listing : pas de carte surélevée, seulement de la typographie. */
export function ArticleCard({ article, priority = false, showImage = true }: Props) {
  const category = asCategory(article.category)
  const href = articlePath(article)

  return (
    <Box component="article" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {showImage && article.featuredImage ? (
        <AppLink href={href} tabIndex={-1} aria-hidden sx={{ display: 'block', mb: 2 }}>
          <MediaImage
            media={article.featuredImage}
            ratio={16 / 10}
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
            priority={priority}
          />
        </AppLink>
      ) : null}

      {category ? (
        <Box sx={{ mb: 1 }}>
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

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        {article.excerpt}
      </Typography>

      <Box sx={{ mt: 'auto' }}>
        <ArticleMeta publishedAt={article.publishedAt} readingTime={article.readingTime} />
      </Box>
    </Box>
  )
}

export default ArticleCard
