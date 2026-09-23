import type { Metadata } from 'next'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import ArticleCard from '@/components/article/ArticleCard'
import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import GuideCard from '@/components/guide/GuideCard'
import SearchField from '@/components/SearchField'
import SectionHeading from '@/components/SectionHeading'
import { searchContent } from '@/lib/queries/search'
import { searchPath } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'Recherche',
  description: 'Rechercher dans les articles, l’actualité et les guides d’Infos Élus.',
}

type Props = {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const term = q?.trim() ?? ''

  const { articles, guides, total } = await searchContent(term)

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <Typography
        variant="h1"
        component="h1"
        sx={{ fontSize: 'clamp(1.75rem, 1.3rem + 1.6vw, 2.5rem)', mb: 2 }}
      >
        Rechercher
      </Typography>

      <Typography
        variant="lede"
        component="p"
        sx={{ color: 'text.secondary', mb: 3, maxWidth: '58ch' }}
      >
        Articles, actualité et guides : retrouvez tous les contenus d’Infos Élus.
      </Typography>

      <Box sx={{ maxWidth: 520 }}>
        <SearchField
          action={searchPath}
          label="Votre recherche"
          placeholder="Droit du travail, budget, élections…"
          defaultValue={term}
          fullWidth
        />
      </Box>

      {term.length >= 2 ? (
        <Box sx={{ mt: { xs: 4, md: 5 } }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {total === 0
              ? `Aucun résultat pour « ${term} ».`
              : `${total} résultat${total > 1 ? 's' : ''} pour « ${term} ».`}
          </Typography>

          {articles.length > 0 ? (
            <Box
              component="section"
              aria-labelledby="resultats-articles"
              sx={{ mb: { xs: 4, md: 6 } }}
            >
              <SectionHeading id="resultats-articles" title="Articles et actualité" />
              <Grid container spacing={{ xs: 2.5, md: 3 }}>
                {articles.map((article) => (
                  <Grid key={article.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <ArticleCard article={article} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : null}

          {guides.length > 0 ? (
            <Box component="section" aria-labelledby="resultats-guides">
              <SectionHeading id="resultats-guides" title="Guides" />
              <Grid container spacing={{ xs: 2.5, md: 3 }}>
                {guides.map((guide) => (
                  <Grid key={guide.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <GuideCard guide={guide} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : null}

          {total === 0 ? (
            <EmptyState
              title="Aucun résultat"
              description="Essayez avec un autre mot-clé, ou parcourez les rubriques depuis le menu."
            />
          ) : null}
        </Box>
      ) : null}
    </Container>
  )
}
