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
  /**
   * Niveau du titre. `h2` quand le grand format ouvre la page (le H1 est le
   * bandeau de rubrique), `h3` quand il est posé sous un titre de section.
   */
  headingLevel?: 'h2' | 'h3'
  priority?: boolean
}

const asCategory = (value: Article['category']): Category | null =>
  value && typeof value === 'object' ? value : null

/**
 * Grand format d'ouverture du fil d'actualité (§ 2.3) : pleine largeur, grande
 * image, catégorie, titre en grande taille, chapô complet en Source Serif 4, date
 * et temps de lecture. C'est le point d'entrée visuel de la page.
 *
 * L'image passe à gauche à partir de 900px et se place au-dessus du texte en
 * dessous, pour rester grande sans écraser le titre sur un écran étroit.
 */
export function FeaturedArticle({ article, headingLevel = 'h2', priority = true }: Props) {
  const category = asCategory(article.category)
  const href = articlePath(article)
  const hasImage = Boolean(article.featuredImage)

  return (
    <Card
      component="article"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: hasImage ? '1.05fr 0.95fr' : '1fr' },
        overflow: 'hidden',
      }}
    >
      {hasImage ? (
        <AppLink href={href} tabIndex={-1} aria-hidden sx={{ display: 'block' }}>
          <MediaImage
            media={article.featuredImage}
            cover
            sizes="(max-width: 900px) 100vw, 52vw"
            priority={priority}
            sx={{ minHeight: { xs: 220, sm: 300, md: 360 } }}
          />
        </AppLink>
      ) : null}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 2.5, sm: 3, md: 4 },
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip
            label="À la une"
            size="small"
            sx={{ backgroundColor: colors.sandPale, color: colors.ink, fontWeight: 600 }}
          />
          {category ? (
            <CategoryLabel
              name={category.name}
              href={category.slug ? categoryPath(category.slug) : undefined}
            />
          ) : null}
        </Box>

        <Typography
          variant="h1"
          component={headingLevel}
          sx={{ fontSize: 'clamp(1.5rem, 1.15rem + 1.5vw, 2.125rem)', mb: 2 }}
        >
          <AppLink href={href} underline="none" sx={{ color: 'text.primary' }}>
            {article.title}
          </AppLink>
        </Typography>

        <Typography variant="lede" component="p" sx={{ color: 'text.secondary', mb: 2.5 }}>
          {article.excerpt}
        </Typography>

        <ArticleMeta
          publishedAt={article.publishedAt}
          readingTime={article.readingTime}
          variant="compact"
          emphasizeDate={article.type === 'news'}
        />
      </Box>
    </Card>
  )
}

export default FeaturedArticle
