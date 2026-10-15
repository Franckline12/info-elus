import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import AppLink from '@/components/AppLink'
import ArticleMeta from '@/components/ArticleMeta'
import CategoryLabel from '@/components/CategoryLabel'
import MediaImage from '@/components/MediaImage'
import { articlePath, categoryPath } from '@/lib/routes'
import type { Article, Category } from '@/payload-types'
import { colors, hoverShadow, rule, surfaceBorder } from '@/theme/tokens'

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
          ? { xs: '96px 1fr auto', sm: '190px 1fr auto' }
          : '1fr auto',
        gap: { xs: 2, sm: 3 },
        alignItems: 'center',
        p: { xs: 1.75, sm: 2.25 },
        bgcolor: colors.paperRaised,
        border: `1px solid ${surfaceBorder}`,
        borderRadius: '8px',
        borderLeft: `4px solid ${colors.blueMid}`,
        transition: 'all 200ms ease',
        '&:hover': {
          borderLeftColor: colors.blueBright,
          borderColor: rule,
          boxShadow: `0 4px 16px ${hoverShadow}`,
          transform: 'translateX(3px)',
          '& .item-thumb img': {
            transform: 'scale(1.05)',
          },
          '& .item-title': {
            color: colors.blueBright,
          },
          '& .item-arrow-box': {
            bgcolor: colors.blueBright,
            color: '#ffffff',
            borderColor: colors.blueBright,
          },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '&:hover': { transform: 'none' },
          '&:hover .item-thumb img': { transform: 'none' },
        },
      }}
    >
      {article.featuredImage ? (
        <AppLink
          href={href}
          tabIndex={-1}
          aria-hidden
          className="item-thumb"
          sx={{
            display: 'block',
            overflow: 'hidden',
            borderRadius: '6px',
            border: `1px solid ${surfaceBorder}`,
            position: 'relative',
            bgcolor: colors.blueDeep,
            '& img': {
              transition: 'transform 400ms ease-out',
            },
          }}
        >
          <MediaImage
            media={article.featuredImage}
            ratio={4 / 3}
            sizes="(max-width: 600px) 96px, 190px"
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

        <Typography
          variant="h4"
          component="h3"
          className="item-title"
          sx={{
            fontSize: { xs: '1.0625rem', sm: '1.1875rem' },
            fontWeight: 800,
            lineHeight: 1.3,
            mb: 1,
            color: colors.ink,
            transition: 'color 160ms ease',
          }}
        >
          <AppLink href={href} underline="none" sx={{ color: 'inherit' }}>
            {article.title}
          </AppLink>
        </Typography>

        {showExcerpt ? (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.875rem',
              lineHeight: 1.55,
              mb: 1.5,
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

      <Box
        className="item-arrow-box"
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: `1px solid ${surfaceBorder}`,
          bgcolor: colors.paper,
          color: colors.ink,
          justifySelf: 'end',
          transition: 'all 200ms ease',
          flexShrink: 0,
        }}
      >
        <ChevronRightIcon aria-hidden fontSize="small" />
      </Box>
    </Box>
  )
}

export default ArticleListItem
