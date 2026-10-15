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
import { colors, fonts, hoverShadow, radius, rule, surfaceBorder } from '@/theme/tokens'

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
        gridTemplateColumns: { xs: '1fr', md: hasImage ? '1.1fr 0.9fr' : '1fr' },
        overflow: 'hidden',
        bgcolor: colors.paperRaised,
        border: `1px solid ${rule}`,
        borderTop: `4px solid ${colors.blueDeep}`,
        borderRadius: `${radius}px`,
        boxShadow: `0 4px 20px ${hoverShadow}`,
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 12px 32px ${hoverShadow}`,
          '& .featured-image img': {
            transform: 'scale(1.04)',
          },
          '& .cta-btn': {
            bgcolor: colors.blueBright,
          },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '&:hover': { transform: 'none' },
          '&:hover .featured-image img': { transform: 'none' },
        },
      }}
    >
      {hasImage ? (
        <AppLink
          href={href}
          tabIndex={-1}
          aria-hidden
          className="featured-image"
          sx={{
            display: 'block',
            overflow: 'hidden',
            position: 'relative',
            bgcolor: colors.blueDeep,
            '& img': {
              transition: 'transform 500ms ease-out',
            },
          }}
        >
          <MediaImage
            media={article.featuredImage}
            cover
            sizes="(max-width: 900px) 100vw, 52vw"
            priority={priority}
            sx={{ minHeight: { xs: 240, sm: 320, md: 400 } }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              bgcolor: 'rgba(18, 25, 59, 0.85)',
              backdropFilter: 'blur(4px)',
              color: colors.paper,
              px: 1.5,
              py: 0.5,
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Grand Format
          </Box>
        </AppLink>
      ) : null}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 3, sm: 4, md: 5 },
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25, mb: 2 }}>
          <Chip
            label="À LA UNE"
            size="small"
            sx={{ backgroundColor: colors.bluePale, color: colors.blueMid, fontWeight: 600 }}
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
          sx={{
            fontSize: 'clamp(1.625rem, 1.2rem + 1.5vw, 2.375rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            mb: 2.5,
            color: colors.ink,
          }}
        >
          <AppLink
            href={href}
            underline="none"
            sx={{ color: 'inherit', '&:hover': { color: colors.blueBright } }}
          >
            {article.title}
          </AppLink>
        </Typography>

        <Box
          sx={{
            pl: 2,
            mb: 3,
            borderLeft: `3px solid ${colors.accentQuiz}`,
            bgcolor: colors.sandPale,
            py: 1.5,
            pr: 2,
            borderRadius: '0 4px 4px 0',
          }}
        >
          <Typography
            variant="lede"
            component="p"
            sx={{
              fontFamily: fonts.serif,
              color: colors.ink,
              fontSize: { xs: '0.9375rem', sm: '1.0625rem' },
              lineHeight: 1.6,
              m: 0,
              fontStyle: 'italic',
            }}
          >
            {article.excerpt}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            pt: 2.5,
            borderTop: `1px solid ${rule}`,
            mt: 'auto',
          }}
        >
          <ArticleMeta
            publishedAt={article.publishedAt}
            readingTime={article.readingTime}
            variant="compact"
            emphasizeDate={article.type === 'news'}
          />

          <AppLink
            href={href}
            underline="none"
            className="cta-btn"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              px: 2.5,
              py: 1.25,
              borderRadius: '4px',
              bgcolor: colors.blueDeep,
              color: colors.paper,
              fontWeight: 700,
              fontSize: '0.875rem',
              transition: 'background-color 200ms ease, transform 150ms ease',
              '&:hover': {
                bgcolor: colors.blueBright,
                color: '#ffffff',
              },
            }}
          >
            Lire l'actualité &rarr;
          </AppLink>
        </Box>
      </Box>
    </Card>
  )
}

export default FeaturedArticle
