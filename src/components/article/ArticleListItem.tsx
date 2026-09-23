import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

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

/**
 * Entrée de fil chronologique (maquette « Les autres actualités ») : vignette
 * étroite à gauche, texte au centre, chevron de renvoi à droite.
 */
export function ArticleListItem({ article, showExcerpt = false }: Props) {
  const category = asCategory(article.category)
  const href = articlePath(article)

  return (
    <Box
      component="article"
      sx={{
        display: 'grid',
        gridTemplateColumns: article.featuredImage
          ? { xs: '84px 1fr auto', sm: '132px 1fr auto' }
          : '1fr auto',
        gap: { xs: 1.5, sm: 2.5 },
        alignItems: 'center',
      }}
    >
      {article.featuredImage ? (
        <AppLink href={href} tabIndex={-1} aria-hidden sx={{ display: 'block' }}>
          <MediaImage
            media={article.featuredImage}
            ratio={4 / 3}
            sizes="(max-width: 600px) 84px, 132px"
          />
        </AppLink>
      ) : null}

      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" component="h3" sx={{ fontSize: '1rem', mb: 1 }}>
          <AppLink href={href} underline="none" sx={{ color: 'text.primary' }}>
            {article.title}
          </AppLink>
        </Typography>

        {showExcerpt ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.25 }}>
            {article.excerpt}
          </Typography>
        ) : null}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
          {category ? (
            <CategoryLabel
              name={category.name}
              href={category.slug ? categoryPath(article.type, category.slug) : undefined}
            />
          ) : null}

          <ArticleMeta
            publishedAt={article.publishedAt}
            readingTime={article.readingTime}
            variant="compact"
          />
        </Box>
      </Box>

      <ChevronRightIcon aria-hidden sx={{ color: 'text.secondary', justifySelf: 'end' }} />
    </Box>
  )
}

export default ArticleListItem
