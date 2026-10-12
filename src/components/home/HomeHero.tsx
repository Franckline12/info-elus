import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import AppLink from '@/components/AppLink'
import ArticleMeta from '@/components/ArticleMeta'
import MediaImage from '@/components/MediaImage'
import { articlePath } from '@/lib/routes'
import type { Article } from '@/payload-types'
import { colors, radius } from '@/theme/tokens'

type Props = {
  article: Article
}

/**
 * Bandeau d'ouverture de l'accueil : bloc bleu profond, texte à gauche, image à
 * droite (maquette « À la une »). L'article affiché vient de Payload — le
 * premier coché « À la une », à défaut le plus récent.
 */
export function HomeHero({ article }: Props) {
  const href = articlePath(article)

  return (
    <Box
      component="section"
      aria-labelledby="a-la-une"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
        bgcolor: colors.blueDeep,
        color: colors.paper,
        borderRadius: `${radius}px`,
        overflow: 'hidden',
        // Sur fond sombre, l'anneau de focus bleu vif manquerait de contraste.
        '& :focus-visible': { outlineColor: colors.paper },
      }}
    >
      <Box
        sx={{
          order: { xs: 2, md: 1 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 2.5, sm: 4, md: 5 },
          py: { xs: 3.5, md: 5 },
        }}
      >
        <Chip
          label="À la une"
          size="small"
          sx={{
            alignSelf: 'flex-start',
            mb: 2,
            backgroundColor: 'rgba(243, 240, 230, 0.14)',
            color: colors.paper,
            fontWeight: 600,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
          }}
        />

        <Typography
          id="a-la-une"
          component="h1"
          sx={{
            fontSize: 'clamp(1.75rem, 1.2rem + 2.2vw, 2.75rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            mb: 2,
          }}
        >
          <AppLink href={href} underline="none" sx={{ color: 'inherit' }}>
            {article.title}
          </AppLink>
        </Typography>

        <Typography
          component="p"
          sx={{ color: colors.bluePale, fontSize: { xs: '0.9375rem', md: '1rem' }, mb: 2.5 }}
        >
          {article.excerpt}
        </Typography>

        <Box sx={{ color: colors.bluePale, mb: 3 }}>
          <ArticleMeta
            publishedAt={article.publishedAt}
            readingTime={article.readingTime}
            variant="compact"
            inherit
          />
        </Box>

        <Button
          component={AppLink}
          href={href}
          color="bluePale"
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          underline="none"
          sx={{ alignSelf: 'flex-start' }}
        >
          Lire l’article
        </Button>
      </Box>

      {article.featuredImage ? (
        <Box sx={{ order: { xs: 1, md: 2 }, minHeight: { xs: 200, sm: 260, md: 'auto' } }}>
          <MediaImage
            media={article.featuredImage}
            cover
            sizes="(max-width: 900px) 100vw, 46vw"
            priority
            sx={{ minHeight: { xs: 200, sm: 260, md: '100%' } }}
          />
        </Box>
      ) : null}
    </Box>
  )
}

export default HomeHero
