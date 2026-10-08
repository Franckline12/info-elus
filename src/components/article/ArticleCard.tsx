import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'
import ArticleMeta from '@/components/ArticleMeta'
import CategoryLabel from '@/components/CategoryLabel'
import MediaImage from '@/components/MediaImage'
import { articlePath, categoryPath } from '@/lib/routes'
import type { Article, Category } from '@/payload-types'
import { cardHoverSx } from '@/theme/tokens'

type Props = {
  article: Article
  /** `true` pour les premières vignettes visibles : image chargée en priorité. */
  priority?: boolean
  showImage?: boolean
  showExcerpt?: boolean
}

const asCategory = (value: Article['category']): Category | null =>
  value && typeof value === 'object' ? value : null

/**
 * Vignette de listing : surface papier surélevé, bordure fine — la carte de la
 * maquette (sections « Guides CSE » et « Articles récents »). Au survol, elle se
 * détache par une élévation neutre (`cardHoverSx`), sans bordure bleue.
 */
export function ArticleCard({
  article,
  priority = false,
  showImage = true,
  showExcerpt = false,
}: Props) {
  const category = asCategory(article.category)
  const href = articlePath(article)

  return (
    <Card
      component="article"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        ...cardHoverSx,
      }}
    >
      {showImage && article.featuredImage ? (
        <AppLink href={href} tabIndex={-1} aria-hidden sx={{ display: 'block' }}>
          <MediaImage
            media={article.featuredImage}
            ratio={16 / 9}
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
            priority={priority}
          />
        </AppLink>
      ) : null}

      <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {category ? (
          <Box sx={{ mb: 1.25 }}>
            <CategoryLabel
              name={category.name}
              href={category.slug ? categoryPath(category.slug) : undefined}
            />
          </Box>
        ) : null}

        <Typography variant="h4" component="h3" sx={{ fontSize: '1.0625rem', mb: 1.25 }}>
          <AppLink href={href} underline="none" sx={{ color: 'text.primary' }}>
            {article.title}
          </AppLink>
        </Typography>

        {showExcerpt ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            {article.excerpt}
          </Typography>
        ) : null}

        <Box sx={{ mt: 'auto', pt: 0.5 }}>
          <ArticleMeta
            publishedAt={article.publishedAt}
            readingTime={article.readingTime}
            variant="compact"
          />
        </Box>
      </CardContent>
    </Card>
  )
}

export default ArticleCard
