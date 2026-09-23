import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'
import ArticleMeta from '@/components/ArticleMeta'
import CategoryLabel from '@/components/CategoryLabel'
import MediaImage from '@/components/MediaImage'
import { articlePath, categoryPath } from '@/lib/routes'
import type { Article, Category } from '@/payload-types'
import { colors } from '@/theme/tokens'

type Props = {
  article: Article
  priority?: boolean
}

const asCategory = (value: Article['category']): Category | null =>
  value && typeof value === 'object' ? value : null

/**
 * Grand format d'ouverture d'un listing (§ 2.3) : image à gauche, texte à
 * droite, badge « À la une » — la carte large de la maquette « Actualité ».
 */
export function FeaturedArticle({ article, priority = true }: Props) {
  const category = asCategory(article.category)
  const href = articlePath(article)
  const hasImage = Boolean(article.featuredImage)

  return (
    <Card
      component="article"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: hasImage ? '0.85fr 1.15fr' : '1fr' },
        overflow: 'hidden',
      }}
    >
      {hasImage ? (
        <AppLink
          href={href}
          tabIndex={-1}
          aria-hidden
          sx={{ display: 'block', minHeight: { xs: 180, sm: '100%' } }}
        >
          <MediaImage
            media={article.featuredImage}
            cover
            sizes="(max-width: 600px) 100vw, 38vw"
            priority={priority}
            sx={{ minHeight: { xs: 180, sm: '100%' } }}
          />
        </AppLink>
      ) : null}

      <Box sx={{ p: { xs: 2.5, md: 3 } }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Chip
            label="À la une"
            size="small"
            sx={{ backgroundColor: colors.sandPale, color: colors.ink, fontWeight: 600 }}
          />
          {category ? (
            <CategoryLabel
              name={category.name}
              href={category.slug ? categoryPath(article.type, category.slug) : undefined}
            />
          ) : null}
        </Box>

        <Typography
          variant="h2"
          component="h3"
          sx={{ fontSize: { xs: '1.375rem', md: '1.625rem' }, mb: 1.5 }}
        >
          <AppLink href={href} underline="none" sx={{ color: 'text.primary' }}>
            {article.title}
          </AppLink>
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          {article.excerpt}
        </Typography>

        <ArticleMeta
          publishedAt={article.publishedAt}
          readingTime={article.readingTime}
          variant="compact"
        />
      </Box>
    </Card>
  )
}

export default FeaturedArticle
