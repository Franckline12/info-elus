import type { Metadata } from 'next'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import GuideCard from '@/components/guide/GuideCard'
import PageHero from '@/components/PageHero'
import SearchBar from '@/components/SearchBar'
import { taxonomyOptions } from '@/lib/filterOptions'
import { countGuidesByTheme, getGuides } from '@/lib/queries/guides'
import { getThemes } from '@/lib/queries/themes'
import { guidesPath } from '@/lib/routes'

const PER_PAGE = 9

export const metadata: Metadata = {
  title: 'Guides CSE',
  description:
    'Des fiches pratiques et complètes pour vous accompagner dans vos missions d’élu : élections, budget, santé et sécurité, négociation.',
}

type Props = {
  searchParams: Promise<{ theme?: string; q?: string }>
}

export default async function GuidesPage({ searchParams }: Props) {
  const { theme, q } = await searchParams

  const [result, themes, counts] = await Promise.all([
    getGuides({ themeSlug: theme, search: q, limit: PER_PAGE }),
    getThemes(),
    countGuidesByTheme({ search: q }),
  ])

  const activeTheme = themes.find((item) => item.slug === theme)

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <PageHero
        backgroundImage="/images/guides.jpeg"
        title="Guides CSE"
        description="Des fiches pratiques et complètes pour vous accompagner dans vos missions d’élu."
      />

      <Box sx={{ mt: { xs: 2.5, md: 3 } }}>
        <SearchBar
          action={guidesPath}
          label="Rechercher un guide"
          placeholder="Rechercher un guide…"
          defaultValue={q}
          filters={[
            {
              name: 'theme',
              label: 'Filtrer par thème',
              allLabel: 'Tous les thèmes',
              allCount: counts.total,
              value: theme,
              options: taxonomyOptions(themes, counts),
            },
          ]}
          resultLabel={`${result.totalDocs} guide${result.totalDocs > 1 ? 's' : ''}`}
        />
      </Box>

      <Box sx={{ mt: { xs: 3, md: 4 } }}>
        {result.docs.length === 0 ? (
          <EmptyState
            title="Aucun guide pour le moment"
            description={
              q
                ? `Aucun guide ne correspond à « ${q} ».`
                : activeTheme
                  ? `Aucun guide publié dans le thème « ${activeTheme.name} ».`
                  : 'Les premières fiches pratiques seront publiées prochainement.'
            }
          />
        ) : (
          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            {result.docs.map((guide, index) => (
              <Grid key={guide.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <GuideCard guide={guide} priority={index < 3} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  )
}
