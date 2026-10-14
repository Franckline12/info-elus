import type { Metadata } from 'next'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'
import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import FilterLinks from '@/components/FilterLinks'
import PageHero from '@/components/PageHero'
import PaginationLinks from '@/components/PaginationLinks'
import SectionHeading from '@/components/SectionHeading'
import ProviderRow from '@/components/provider/ProviderRow'
import ProviderSubscriptionForm from '@/components/provider/ProviderSubscriptionForm'
import SubscribedProviderCard from '@/components/provider/SubscribedProviderCard'
import { interventionAreaLabel, interventionAreaValue } from '@/lib/interventionAreas'
import { providerCategoryLabel, providerCategoryValue } from '@/lib/providerCategories'
import {
  getAreasWithCount,
  getCategoriesWithCount,
  getProviders,
  getSubscribedProviders,
} from '@/lib/queries/providers'
import { parsePage, providersPagePath, providersPath } from '@/lib/routes'
import { colors, radius, rule, surfaceBorder } from '@/theme/tokens'

const PER_PAGE = 10

const INTRO =
  'Formation, conseil juridique, comptabilité, billetterie, événementiel : les élus de CSE ' +
  'ont régulièrement besoin d’un appui extérieur. Cet annuaire rassemble des prestataires ' +
  'qui travaillent avec les comités, classés par métier et par zone d’intervention.'

export const metadata: Metadata = {
  title: 'Annuaire des prestataires',
  description:
    'Formation, assistance juridique, comptabilité, billetterie, événementiel : des prestataires qui accompagnent les élus de CSE, par métier et par région.',
}

type Props = {
  searchParams: Promise<{ categorie?: string; zone?: string; page?: string }>
}

/** Libellé du décompte, accordé au singulier comme au pluriel. */
const resultLabel = (total: number): string =>
  `${total} prestataire${total > 1 ? 's' : ''} référencé${total > 1 ? 's' : ''}`

export default async function ProvidersPage({ searchParams }: Props) {
  const params = await searchParams

  // Une valeur inconnue dans l'URL est ignorée plutôt que renvoyée à la base :
  // le filtre retombe alors sur « toutes », et non sur une liste vide.
  const categorySlug = providerCategoryValue(params.categorie)
  const area = interventionAreaValue(params.zone)
  const page = parsePage(params.page)

  const [subscribedProviders, categories, areas] = await Promise.all([
    getSubscribedProviders({ categorySlug, area }),
    // Chaque famille de filtres se compte sans elle-même : une option annonce
    // ce qu'elle donnerait si on la choisissait, l'autre filtre restant actif.
    getCategoriesWithCount({ area }),
    getAreasWithCount({ categorySlug }),
  ])

  // Les prestataires mis en avant en tête d'annuaire sont exclus de la liste standard
  const excludeIds = subscribedProviders.map((provider) => provider.id)

  const result = await getProviders({
    categorySlug,
    area,
    page,
    limit: PER_PAGE,
    excludeIds,
  })

  const filtered = Boolean(categorySlug || area)

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <PageHero
        backgroundImage="/images/prestataire.jpeg"
        backgroundPosition="center"
        title="Réseau de prestataires"
        description="Des partenaires qui accompagnent les élus dans leurs projets et leurs missions."
      />

      {/* Texte d'introduction */}
      <Typography
        variant="lede"
        component="p"
        sx={{ mt: { xs: 2.5, md: 3 }, maxWidth: '68ch', color: 'text.secondary' }}
      >
        {INTRO}
      </Typography>

      {/* Formulaire pour devenir abonné */}
      <ProviderSubscriptionForm />

      {/* Séparateur */}
      <Box component="hr" sx={{ border: 'none', borderTop: `1px solid ${rule}`, my: { xs: 3, md: 4 } }} />

      {/* Section Prestataires abonnés (cartes grand format) */}
      <Box component="section" aria-labelledby="prestataires-abonnes">
        <SectionHeading
          id="prestataires-abonnes"
          title={`Prestataire${subscribedProviders.length > 1 ? 's' : ''} abonné${
            subscribedProviders.length > 1 ? 's' : ''
          }`}
        />

        {subscribedProviders.length > 0 ? (
          <Box sx={{ display: 'grid', gap: { xs: 2, md: 2.5 } }}>
            {subscribedProviders.map((provider) => (
              <SubscribedProviderCard key={provider.id} provider={provider} />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              p: { xs: 2.5, md: 3.5 },
              backgroundColor: colors.paperRaised,
              border: `1px dashed ${surfaceBorder}`,
              borderRadius: `${radius}px`,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', m: 0 }}>
              Aucun prestataire abonné pour le moment. Remplissez le formulaire ci-dessus pour devenir
              le premier partenaire mis en avant dans notre annuaire !
            </Typography>
          </Box>
        )}
      </Box>

      {/* Séparateur */}
      <Box component="hr" sx={{ border: 'none', borderTop: `1px solid ${rule}`, my: { xs: 3, md: 4 } }} />

      {/* Section Prestataires référencés */}
      <Box component="section" aria-labelledby="prestataires-references" sx={{ mt: 0 }}>
        <SectionHeading
          id="prestataires-references"
          title="Prestataires référencés"
        />

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 1.5, md: 2 },
            pt: { xs: 1.5, md: 2 },
            borderTop: `1px solid ${rule}`,
          }}
        >
          <FilterLinks
            label="Filtrer par catégorie"
            items={[
              {
                key: 'all',
                label: 'Toutes les catégories',
                href: providersPagePath({ area }),
                active: !categorySlug,
              },
              ...categories.map((category) => ({
                key: category.value,
                label: `${category.label} (${category.count ?? 0})`,
                href: providersPagePath({ categorySlug: category.value, area }),
                active: category.value === categorySlug,
              })),
            ]}
          />

          <FilterLinks
            label="Filtrer par zone d’intervention"
            items={[
              {
                key: 'all',
                label: 'Toutes les zones',
                href: providersPagePath({ categorySlug }),
                active: !area,
              },
              ...areas.map((item) => ({
                key: item.value,
                label: `${item.label} (${item.count ?? 0})`,
                href: providersPagePath({ categorySlug, area: item.value }),
                active: item.value === area,
              })),
            ]}
          />
        </Box>

        <Typography
          component="p"
          aria-live="polite"
          sx={{ mt: { xs: 2, md: 2.5 }, fontSize: '0.875rem', color: 'text.secondary' }}
        >
          {resultLabel(result.totalDocs)}
        </Typography>

        <Box sx={{ mt: { xs: 2, md: 2.5 } }}>
          {result.docs.length === 0 ? (
            <EmptyState
              title="Aucun prestataire ne correspond"
              description={
                filtered
                  ? `Aucun prestataire référencé pour ce croisement${
                      categorySlug ? ` de la catégorie « ${providerCategoryLabel(categorySlug)} »` : ''
                    }${area ? ` en ${interventionAreaLabel(area)}` : ''}.`
                  : 'Les premiers partenaires seront référencés prochainement.'
              }
            />
          ) : (
            <Box
              component="ul"
              sx={{ listStyle: 'none', m: 0, p: 0, borderTop: `1px solid ${rule}` }}
            >
              {result.docs.map((provider) => (
                <Box component="li" key={provider.id} sx={{ borderBottom: `1px solid ${rule}` }}>
                  <ProviderRow provider={provider} />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {filtered ? (
          <Box sx={{ mt: { xs: 2, md: 2.5 } }}>
            <AppLink href={providersPath} sx={{ fontSize: '0.875rem' }}>
              Réinitialiser les filtres
            </AppLink>
          </Box>
        ) : null}

        <PaginationLinks
          basePath={providersPath}
          page={result.page ?? 1}
          totalPages={result.totalPages}
          params={{ categorie: categorySlug, zone: area }}
        />
      </Box>

      {/*
        Mention éditoriale : l'annuaire est alimenté par la rédaction, il ne
        constitue pas une recommandation. À faire valider par le client.
      */}
      <Typography
        component="p"
        sx={{
          mt: { xs: 5, md: 6 },
          pt: { xs: 2, md: 2.5 },
          borderTop: `1px solid ${rule}`,
          maxWidth: '68ch',
          fontSize: '0.8125rem',
          color: 'text.secondary',
        }}
      >
        Le référencement d’un prestataire dans cet annuaire ne vaut ni recommandation ni
        partenariat commercial d’Infos Élus, sauf mention contraire sur la fiche. Il revient à
        chaque comité de vérifier les prestations et les tarifs proposés avant tout engagement.
      </Typography>
    </Container>
  )
}
