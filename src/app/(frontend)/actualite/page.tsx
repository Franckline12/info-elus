import type { Metadata } from 'next'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'

import AppLink from '@/components/AppLink'
import FeaturedArticle from '@/components/article/FeaturedArticle'
import NewsFeed from '@/components/article/NewsFeed'
import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import NewsletterBlock from '@/components/NewsletterBlock'
import PageHero from '@/components/PageHero'
import PaginationLinks from '@/components/PaginationLinks'
import SectionHeading from '@/components/SectionHeading'
import { getFeaturedNews, getLatestNews } from '@/lib/queries/articles'
import { getCategories } from '@/lib/queries/categories'
import { categoryPath, listingPath, newsPagePath, parsePage } from '@/lib/routes'
import { absoluteUrl, siteName } from '@/lib/site'
import type { Article, Category } from '@/payload-types'
import { colors, fonts, radius, surfaceBorder } from '@/theme/tokens'

const PER_PAGE = 10

const HERO_TITLE = 'Toute l’actualité CSE'

const DESCRIPTION =
  'Le fil d’actualité juridique et sociale du CSE : jurisprudence, réformes et décisions qui changent le quotidien des élus.'

type Props = {
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page: pageParam } = await searchParams
  const page = parsePage(pageParam)
  const url = absoluteUrl(newsPagePath(page))

  const title = page > 1 ? `Actualité — page ${page}` : 'Actualité'

  return {
    title,
    description: DESCRIPTION,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} — ${siteName}`,
      description: DESCRIPTION,
      url,
      siteName,
      locale: 'fr_FR',
      type: 'website',
    },
  }
}

export default async function ActualitePage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = parsePage(pageParam)

  const [featured, categories] = await Promise.all([
    getFeaturedNews(),
    getCategories(),
  ])

  const feed = await getLatestNews({ page, limit: PER_PAGE, excludeId: featured?.id })

  const lead = page === 1 ? featured : null
  const isEmpty = featured === null && feed.docs.length === 0

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      {/* Bandeau Supérieur style Journal / Masthead Ticker */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          pb: 1.5,
          mb: 3,
          borderBottom: `2px solid ${colors.blueDeep}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.5,
              bgcolor: colors.blueDeep,
              color: colors.paper,
              borderRadius: '4px',
              fontSize: '0.6875rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: colors.accentQuiz,
              }}
            />
            ÉDITION DU JOUR
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontFamily: fonts.sans,
              fontWeight: 700,
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            FIL D'INFORMATION JURIDIQUE & SOCIALE
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: colors.blueMid,
            fontWeight: 600,
            fontSize: '0.75rem',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          Informations en direct pour les élus de CSE
        </Typography>
      </Box>

      {/* Hero Principal */}
      <PageHero
        title={HERO_TITLE}
        description="Jurisprudence, réformes, accords : les dernières informations juridiques, sociales et pratiques pour les élus du CSE, de la plus récente à la plus ancienne."
      />

      <Box sx={{ mt: { xs: 3, md: 4 } }}>
        {isEmpty ? (
          <EmptyState
            title="Aucune actualité pour le moment"
            description="Le fil d’actualité sera alimenté prochainement. En attendant, les articles de fond et les guides sont accessibles depuis le menu."
          />
        ) : null}

        {lead ? (
          <Box component="section" aria-label="À la une de l’actualité">
            <FeaturedArticle article={lead} headingLevel="h2" />
          </Box>
        ) : null}

        {feed.docs.length > 0 ? (
          <Box
            component="section"
            aria-labelledby="fil-actualite"
            sx={{ mt: lead ? { xs: 5, md: 6 } : 0 }}
          >
            <Grid container spacing={{ xs: 3, md: 4 }}>
              {/* Colonne principale : Fil d'actualité */}
              <Grid size={{ xs: 12, md: 8 }}>
                <SectionHeading
                  id="fil-actualite"
                  title={lead ? 'Les autres actualités' : 'Le fil d’actualité'}
                />

                <NewsFeed articles={feed.docs} />

                <PaginationLinks
                  basePath={listingPath('news')}
                  page={feed.page ?? 1}
                  totalPages={feed.totalPages}
                />
              </Grid>

              {/* Colonne latérale : Informations & Widgets Éditoriaux */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 3, md: 4 },
                    position: { md: 'sticky' },
                    top: 24,
                  }}
                >
                  {/* Widget 1 : Newsletter */}
                  <NewsletterBlock source="/actualite" component="h3" headingId="newsletter-sidebar" />

                  {/* Widget 2 : Thématiques d'actualité */}
                  {categories.length > 0 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        bgcolor: colors.paperRaised,
                        border: `1px solid ${surfaceBorder}`,
                        borderRadius: `${radius}px`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <LocalOfferOutlinedIcon sx={{ fontSize: '1.25rem', color: colors.blueMid }} />
                        <Typography
                          variant="h3"
                          component="h3"
                          sx={{ fontSize: '1.125rem', fontWeight: 700 }}
                        >
                          Dossiers par catégorie
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        Consultez tous nos articles de fond classés par thématique juridique et sociale.
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {categories.map((cat) => (
                          <Chip
                            key={cat.id}
                            label={cat.name}
                            component={AppLink}
                            href={cat.slug ? categoryPath(cat.slug) : '/articles'}
                            clickable
                            size="small"
                            sx={{
                              bgcolor: colors.paper,
                              color: colors.ink,
                              border: `1px solid ${surfaceBorder}`,
                              fontWeight: 500,
                              fontSize: '0.8125rem',
                              '&:hover': {
                                bgcolor: colors.bluePale,
                                color: colors.blueDeep,
                                borderColor: colors.blueBright,
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Paper>
                  ) : null}

                  {/* Widget 3 : Encadré "Repère CSE" */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: colors.sandPale,
                      border: `1px solid ${surfaceBorder}`,
                      borderRadius: `${radius}px`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <InfoOutlinedIcon sx={{ fontSize: '1.25rem', color: colors.ink }} />
                      <Typography
                        variant="h3"
                        component="h3"
                        sx={{ fontSize: '1.0625rem', fontWeight: 700, color: colors.ink }}
                      >
                        Repère CSE
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: colors.ink, lineHeight: 1.6 }}>
                      Les actualités juridiques publiées sur Infos Élus sont rédigées et vérifiées pour
                      vous guider dans l'exercice de votre mandat d'élu (CSSCT, secrétaire, trésorier).
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Box>
        ) : null}
      </Box>
    </Container>
  )
}



