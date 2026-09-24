import type { Metadata } from 'next'
import Box from '@mui/material/Box'

import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import PageHero from '@/components/PageHero'
import ProviderCard from '@/components/provider/ProviderCard'
import SearchBar from '@/components/SearchBar'
import { valueOptions } from '@/lib/filterOptions'
import { providerCategoryOptions } from '@/lib/providerCategories'
import { countProvidersByCategory, getProviders } from '@/lib/queries/providers'
import { providersPath } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'Annuaire des prestataires',
  description:
    'Trouvez des partenaires de confiance pour vous accompagner dans vos projets et vos missions d’élu de CSE.',
}

type Props = {
  searchParams: Promise<{ categorie?: string; q?: string }>
}

export default async function ProvidersPage({ searchParams }: Props) {
  const { categorie, q } = await searchParams

  const [result, counts] = await Promise.all([
    getProviders({ category: categorie, search: q }),
    countProvidersByCategory({ search: q }),
  ])

  const activeCategory = providerCategoryOptions.find((option) => option.value === categorie)

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <PageHero
        backgroundImage="/images/prestataire.jpeg"
        backgroundPosition="center"
        title="Annuaire des prestataires"
        description="Trouvez des partenaires de confiance pour vous accompagner dans vos projets et vos missions."
      />

      <Box sx={{ mt: { xs: 2.5, md: 3 } }}>
        <SearchBar
          action={providersPath}
          label="Rechercher un prestataire"
          placeholder="Rechercher un prestataire…"
          defaultValue={q}
          filters={[
            {
              name: 'categorie',
              label: 'Filtrer par catégorie de prestataire',
              allLabel: 'Toutes les catégories',
              allCount: counts.total,
              value: categorie,
              options: valueOptions(providerCategoryOptions, counts),
            },
          ]}
          resultLabel={`${result.totalDocs} prestataire${result.totalDocs > 1 ? 's' : ''}`}
        />
      </Box>

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
