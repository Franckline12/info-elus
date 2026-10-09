import type { Metadata } from 'next'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined'
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined'

import ArticleCard from '@/components/article/ArticleCard'
import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import GuideCard from '@/components/guide/GuideCard'
import SearchBar from '@/components/SearchBar'
import { searchContent } from '@/lib/queries/search'
import { searchPath } from '@/lib/routes'
import { colors, fonts, rule, surfaceBorder } from '@/theme/tokens'

export const metadata: Metadata = {
  title: 'Recherche',
  description: "Rechercher dans les articles, l'actualité et les guides d'Infos Élus.",
}

type Props = {
  searchParams: Promise<{ q?: string }>
}

/** Bandeaux de section groupant les résultats par type (§ 2.7). */
function ResultSection({
  id,
  icon,
  title,
  count,
  children,
}: {
  id: string
  icon: React.ReactNode
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <Box component="section" aria-labelledby={id} sx={{ mb: { xs: 5, md: 7 } }}>
      {/* En-tête de section : règle + libellé + décompte */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 3,
          pb: 1.5,
          borderBottom: `2px solid ${colors.blueDeep}`,
        }}
      >
        <Box
          aria-hidden
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: colors.blueDeep,
            fontSize: '1.25rem',
          }}
        >
          {icon}
        </Box>
        <Typography
          id={id}
          component="h2"
          sx={{
            fontFamily: fonts.sans,
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: colors.blueDeep,
          }}
        >
          {title}
        </Typography>
        <Box
          aria-hidden
          sx={{
            ml: 'auto',
            px: 1,
            py: 0.25,
            bgcolor: colors.blueDeep,
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#fff',
          }}
        >
          {count}
        </Box>
      </Box>
      {children}
    </Box>
  )
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const term = q?.trim() ?? ''

  const { news, articles, guides, total } = await searchContent(term)

  const hasResults = total > 0
  const hasQuery = term.length >= 2

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      {/* ── Masthead ── */}
      <Box sx={{ mb: { xs: 4, md: 5 } }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontFamily: fonts.sans,
            fontSize: 'clamp(1.75rem, 1.3rem + 1.6vw, 2.5rem)',
            fontWeight: 700,
            mb: 0.75,
          }}
        >
          Recherche
        </Typography>
        <Typography
          variant="body1"
          component="p"
          sx={{ color: 'text.secondary', mb: 3, maxWidth: '58ch' }}
        >
          Articles, actualité et guides : retrouvez tous les contenus d&apos;Infos Élus.
        </Typography>
        <Divider sx={{ mb: 3, borderColor: rule }} />

        <SearchBar
          action={searchPath}
          label="Votre recherche"
          placeholder="Droit du travail, budget, élections…"
          defaultValue={term}
        />
      </Box>

      {/* ── Résultats ── */}
      {hasQuery ? (
        <Box>
          {/* Compteur global */}
          <Typography
            component="p"
            sx={{
              mb: { xs: 4, md: 5 },
              fontSize: '0.9375rem',
              color: 'text.secondary',
              borderLeft: `3px solid ${colors.accentQuiz}`,
              pl: 2,
              py: 0.5,
              bgcolor: colors.sandPale,
            }}
          >
            {!hasResults
              ? `Aucun résultat pour « ${term} ». Essayez un autre mot-clé.`
              : `${total} résultat${total > 1 ? 's' : ''} pour « ${term} » — répartis ci-dessous par rubrique.`}
          </Typography>

          {/* Section Actualité */}
          {news.length > 0 && (
            <ResultSection
              id="resultats-actualite"
              icon={<FeedOutlinedIcon fontSize="inherit" />}
              title="Actualité"
              count={news.length}
            >
              <Grid container spacing={{ xs: 2.5, md: 3 }}>
                {news.map((article) => (
                  <Grid key={article.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <ArticleCard article={article} />
                  </Grid>
                ))}
              </Grid>
            </ResultSection>
          )}

          {/* Section Articles de fond */}
          {articles.length > 0 && (
            <ResultSection
              id="resultats-articles"
              icon={<ArticleOutlinedIcon fontSize="inherit" />}
              title="Articles de fond"
              count={articles.length}
            >
              <Grid container spacing={{ xs: 2.5, md: 3 }}>
                {articles.map((article) => (
                  <Grid key={article.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <ArticleCard article={article} />
                  </Grid>
                ))}
              </Grid>
            </ResultSection>
          )}

          {/* Section Guides */}
          {guides.length > 0 && (
            <ResultSection
              id="resultats-guides"
              icon={<LibraryBooksOutlinedIcon fontSize="inherit" />}
              title="Guides pratiques"
              count={guides.length}
            >
              <Grid container spacing={{ xs: 2.5, md: 3 }}>
                {guides.map((guide) => (
                  <Grid key={guide.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <GuideCard guide={guide} />
                  </Grid>
                ))}
              </Grid>
            </ResultSection>
          )}

          {/* Aucun résultat */}
          {!hasResults && (
            <EmptyState
              title="Aucun résultat"
              description="Essayez avec un autre mot-clé, ou parcourez les rubriques depuis le menu."
            />
          )}
        </Box>
      ) : (
        /* État vide : pas encore de recherche */
        <Box
          sx={{
            mt: { xs: 4, md: 6 },
            p: { xs: 3, md: 5 },
            bgcolor: colors.sandPale,
            border: `1px solid ${surfaceBorder}`,
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <Typography
            component="p"
            sx={{
              fontFamily: fonts.sans,
              fontWeight: 600,
              fontSize: '1rem',
              color: colors.blueDeep,
              mb: 1,
            }}
          >
            Que cherchez-vous ?
          </Typography>
          <Typography component="p" sx={{ fontSize: '0.9375rem', color: 'text.secondary' }}>
            Saisissez un mot-clé dans le champ ci-dessus pour rechercher parmi l&apos;ensemble des
            contenus : actualité, articles de fond et guides pratiques.
          </Typography>
        </Box>
      )}
    </Container>
  )
}
