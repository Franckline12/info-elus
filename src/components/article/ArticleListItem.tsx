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
  /** Le chapô, tronqué à deux lignes. Désactivable pour un fil très resserré. */
  showExcerpt?: boolean
}

const asCategory = (value: Article['category']): Category | null =>
  value && typeof value === 'object' ? value : null

/**
 * Entrée du fil d'actualité (§ 2.3) : vignette à gauche, puis catégorie, titre,
 * chapô tronqué, date et temps de lecture. Les filets qui séparent les entrées
 * sont portés par la liste (`NewsFeed`), pas par l'entrée : c'est une grille
 * éditoriale, pas une carte.
 */
export function ArticleListItem({ article, showExcerpt = true }: Props) {
  const category = asCategory(article.category)
  const href = articlePath(article)

  return (
    <Box
      component="article"
      sx={{
        display: 'grid',
        gridTemplateColumns: article.featuredImage
          ? { xs: '96px 1fr auto', sm: '180px 1fr auto' }
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
            sizes="(max-width: 600px) 96px, 180px"
          />
        </AppLink>
      ) : null}

      <Box sx={{ minWidth: 0 }}>
        {category ? (
          <Box sx={{ mb: 1 }}>
            <CategoryLabel
              name={category.name}
              href={category.slug ? categoryPath(category.slug) : undefined}
            />
          </Box>
        ) : null}

        <Typography variant="h4" component="h3" sx={{ fontSize: '1.0625rem', mb: 1 }}>
          <AppLink href={href} underline="none" sx={{ color: 'text.primary' }}>
            {article.title}
          </AppLink>
        </Typography>

        {showExcerpt ? (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 1.25,
              // Troncature à deux lignes : le fil garde un pas régulier quelle
              // que soit la longueur des chapôs.
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
            }}
          >
            {article.excerpt}
          </Typography>
        ) : null}

        <ArticleMeta
          publishedAt={article.publishedAt}
          readingTime={article.readingTime}
          variant="compact"
          emphasizeDate={article.type === 'news'}
        />
      </Box>

      <ChevronRightIcon aria-hidden sx={{ color: 'text.secondary', justifySelf: 'end' }} />
    </Box>
  )
}

export default ArticleListItem
