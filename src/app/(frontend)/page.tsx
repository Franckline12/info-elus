import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

import ArticleCard from '@/components/article/ArticleCard'
import ArticleListItem from '@/components/article/ArticleListItem'
import FeaturedArticle from '@/components/article/FeaturedArticle'
import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import SectionHeading from '@/components/SectionHeading'
import VisuallyHidden from '@/components/VisuallyHidden'
import { getFeaturedNews, getFeaturedOnHome, getLatestNews } from '@/lib/queries/articles'
import { siteName, siteTagline } from '@/lib/site'
import { rule } from '@/theme/tokens'

/** Page statique régénérée à la demande par le hook de la collection Articles. */
export const revalidate = 3600

export default async function HomePage() {
  const [featuredArticles, featuredNews] = await Promise.all([
    getFeaturedOnHome(3),
    getFeaturedNews(),
  ])

  const latestNews = await getLatestNews(4, featuredNews ? [featuredNews.id] : [])

  const hasNews = Boolean(featuredNews) || latestNews.length > 0

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      {/* Le titre de niveau 1 de l'accueil est le logotype du masthead ; il est
          répété ici pour les lecteurs d'écran et les moteurs, ce qui laisse les
          rubriques en niveau 2. */}
      <VisuallyHidden component="h1">{`${siteName} — ${siteTagline}`}</VisuallyHidden>

      <Box component="section" aria-labelledby="a-la-une">
        <SectionHeading id="a-la-une" title="À la une" href="/articles" />

        {featuredArticles.length === 0 ? (
          <EmptyState
            title="Aucun article à la une"
            description="Cochez « À la une » sur un article depuis l’administration pour le faire apparaître ici."
          />
        ) : (
          <Grid container spacing={{ xs: 4, md: 5 }}>
            {featuredArticles.map((article, index) => (
              <Grid
                key={article.id}
                size={{ xs: 12, md: 4 }}
                sx={{
                  borderTop: { xs: `1px solid ${rule}`, md: 'none' },
                  borderLeft: { md: `1px solid ${rule}` },
                  pt: { xs: 3, md: 0 },
                  pl: { md: 4 },
                  '&:first-of-type': {
                    borderTop: 'none',
                    borderLeft: 'none',
                    pt: 0,
                    pl: { md: 0 },
                  },
                }}
              >
                <ArticleCard article={article} priority={index === 0} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Box component="section" aria-labelledby="actualite" sx={{ mt: { xs: 7, md: 10 } }}>
        <SectionHeading id="actualite" title="Actualité" href="/actualite" />

        {!hasNews ? (
          <EmptyState
            title="Aucune actualité publiée"
            description="Le fil d’actualité apparaîtra ici dès la première publication."
          />
        ) : (
          <Grid container spacing={{ xs: 5, md: 5 }}>
            {featuredNews ? (
              <Grid size={{ xs: 12, md: latestNews.length > 0 ? 7 : 12 }}>
                <FeaturedArticle article={featuredNews} priority={false} />
              </Grid>
            ) : null}

            {latestNews.length > 0 ? (
              <Grid
                size={{ xs: 12, md: featuredNews ? 5 : 12 }}
                sx={{
                  borderTop: { xs: `1px solid ${rule}`, md: featuredNews ? 'none' : undefined },
                  borderLeft: { md: featuredNews ? `1px solid ${rule}` : 'none' },
                  pt: { xs: 4, md: 0 },
                  pl: { md: featuredNews ? 4 : 0 },
                }}
              >
                <Box sx={{ display: 'grid', gap: 3 }}>
                  {latestNews.map((article, index) => (
                    <Box
                      key={article.id}
                      sx={index > 0 ? { borderTop: `1px solid ${rule}`, pt: 3 } : undefined}
                    >
                      <ArticleListItem article={article} showExcerpt={false} />
                    </Box>
                  ))}
                </Box>
              </Grid>
            ) : null}
          </Grid>
        )}
      </Box>
    </Container>
  )
}
