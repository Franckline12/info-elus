import type { Metadata } from 'next'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import FilterLinks from '@/components/FilterLinks'
import type { FilterItem } from '@/components/FilterLinks'
import GuideCard from '@/components/guide/GuideCard'
import PageHero from '@/components/PageHero'
import SearchField from '@/components/SearchField'
import { getGuides } from '@/lib/queries/guides'
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

const guidesPagePath = (params: { theme?: string; q?: string }): string => {
  const search = new URLSearchParams()
  if (params.theme) search.set('theme', params.theme)
  if (params.q) search.set('q', params.q)
  const query = search.toString()
  return query ? `${guidesPath}?${query}` : guidesPath
}

export default async function GuidesPage({ searchParams }: Props) {
  const { theme, q } = await searchParams

  const [result, themes] = await Promise.all([
    getGuides({ themeSlug: theme, search: q, limit: PER_PAGE }),
    getThemes(),
  ])

  const items: FilterItem[] = [
    { key: 'all', label: 'Tous les thèmes', href: guidesPagePath({ q }), active: !theme },
    ...themes.map((item) => ({
      key: String(item.id),
      label: item.name,
      href: guidesPagePath({ theme: item.slug ?? undefined, q }),
      active: Boolean(item.slug) && item.slug === theme,
    })),
  ]

  const activeTheme = themes.find((item) => item.slug === theme)

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <PageHero
        backgroundImage="/images/guides.jpeg"
        title="Guides CSE"
        description="Des fiches pratiques et complètes pour vous accompagner dans vos missions d’élu."
      />

      <Card sx={{ mt: { xs: 2.5, md: 3 } }}>
        <CardContent
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 280px' },
            alignItems: 'center',
            gap: { xs: 2, md: 3 },
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
            <Typography component="p" sx={{ fontSize: '0.875rem', fontWeight: 700, m: 0 }}>
              Filtrer par thème
            </Typography>
            <FilterLinks items={items} label="Filtrer par thème" />
          </Box>

          <SearchField
            action={guidesPath}
            label="Rechercher un guide"
            placeholder="Rechercher un guide…"
            defaultValue={q}
            hidden={{ theme }}
            fullWidth
          />
        </CardContent>
      </Card>

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
