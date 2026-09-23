import type { Metadata } from 'next'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import FilterLinks from '@/components/FilterLinks'
import type { FilterItem } from '@/components/FilterLinks'
import PageHero from '@/components/PageHero'
import ProviderCard from '@/components/provider/ProviderCard'
import SearchField from '@/components/SearchField'
import { providerCategoryOptions } from '@/lib/providerCategories'
import { getProviders } from '@/lib/queries/providers'
import { providersPath } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'Annuaire des prestataires',
  description:
    'Trouvez des partenaires de confiance pour vous accompagner dans vos projets et vos missions d’élu de CSE.',
}

type Props = {
  searchParams: Promise<{ categorie?: string; q?: string }>
}

const providersPagePath = (params: { categorie?: string; q?: string }): string => {
  const search = new URLSearchParams()
  if (params.categorie) search.set('categorie', params.categorie)
  if (params.q) search.set('q', params.q)
  const query = search.toString()
  return query ? `${providersPath}?${query}` : providersPath
}

export default async function ProvidersPage({ searchParams }: Props) {
  const { categorie, q } = await searchParams

  const result = await getProviders({ category: categorie, search: q })

  const items: FilterItem[] = [
    {
      key: 'all',
      label: 'Toutes les catégories',
      href: providersPagePath({ q }),
      active: !categorie,
    },
    ...providerCategoryOptions.map((option) => ({
      key: option.value,
      label: option.label,
      href: providersPagePath({ categorie: option.value, q }),
      active: option.value === categorie,
    })),
  ]

  const activeCategory = providerCategoryOptions.find((option) => option.value === categorie)

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <PageHero
        backgroundImage="/images/prestataire.jpeg"
        backgroundPosition="center"
        title="Annuaire des prestataires"
        description="Trouvez des partenaires de confiance pour vous accompagner dans vos projets et vos missions."
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
              Filtrer par catégorie
            </Typography>
            <FilterLinks items={items} label="Filtrer par catégorie de prestataire" />
          </Box>

          <SearchField
            action={providersPath}
            label="Rechercher un prestataire"
            placeholder="Rechercher un prestataire…"
            defaultValue={q}
            hidden={{ categorie }}
            fullWidth
          />
        </CardContent>
      </Card>

      <Box sx={{ mt: { xs: 3, md: 4 }, display: 'grid', gap: { xs: 2, md: 2.5 } }}>
        {result.docs.length === 0 ? (
          <EmptyState
            title="Aucun prestataire référencé"
            description={
              q
                ? `Aucun prestataire ne correspond à « ${q} ».`
                : activeCategory
                  ? `Aucun prestataire référencé dans la catégorie « ${activeCategory.label} ».`
                  : 'Les premiers partenaires seront référencés prochainement.'
            }
          />
        ) : (
          result.docs.map((provider) => <ProviderCard key={provider.id} provider={provider} />)
        )}
      </Box>
    </Container>
  )
}
