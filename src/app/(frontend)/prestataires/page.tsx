import type { Metadata } from 'next'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'
import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import FilterLinks from '@/components/FilterLinks'
import PageHero from '@/components/PageHero'
import PaginationLinks from '@/components/PaginationLinks'
import ProviderRow from '@/components/provider/ProviderRow'
import { interventionAreaLabel, interventionAreaValue } from '@/lib/interventionAreas'
import {
  getAreasWithCount,
  getCategoriesWithCount,
  getProviderCategories,
  getProviders,
} from '@/lib/queries/providers'
import { parsePage, providersPagePath, providersPath } from '@/lib/routes'
import { rule } from '@/theme/tokens'

const PER_PAGE = 10

const INTRO =
  'Formation, conseil juridique, comptabilité, billetterie, assurance, communication : les ' +
  'élus de CSE ont régulièrement besoin d’un appui extérieur, sur des sujets très divers. ' +
  'Cet annuaire rassemble des prestataires qui travaillent avec les comités, classés par ' +
  'métier et par zone d’intervention.'

export const metadata: Metadata = {
  title: 'Annuaire des prestataires',
  description:
    'Formation, assistance juridique, comptabilité, billetterie, assurance, communication : des prestataires qui accompagnent les élus de CSE, par métier et par région.',
}

type Props = {
  searchParams: Promise<{ categorie?: string; zone?: string; page?: string }>
}

/** Libellé du décompte, accordé au singulier comme au pluriel. */
const resultLabel = (total: number): string =>
  `${total} prestataire${total > 1 ? 's' : ''} référencé${total > 1 ? 's' : ''}`

export default async function ProvidersPage({ searchParams }: Props) {
  const params = await searchParams

  // La taxonomie est lue d'abord : elle sert à la fois de source aux filtres et
  // de liste de référence pour le paramètre d'URL. Une valeur inconnue est
  // ignorée plutôt que renvoyée à la base — le filtre retombe alors sur
  // « toutes », et non sur une liste vide.
  const taxonomy = await getProviderCategories()
  const activeCategory = params.categorie
    ? taxonomy.find((category) => category.slug === params.categorie)
    : undefined

  const categorySlug = activeCategory?.slug ?? undefined
  const area = interventionAreaValue(params.zone)
  const page = parsePage(params.page)

  const [result, categories, areas] = await Promise.all([
    getProviders({ categorySlug, area, page, limit: PER_PAGE }),
    // Chaque famille de filtres se compte sans elle-même : une option annonce
    // ce qu'elle donnerait si on la choisissait, l'autre filtre restant actif.
    getCategoriesWithCount({ area, categories: taxonomy }),
    getAreasWithCount({ categorySlug }),
  ])

  const filtered = Boolean(categorySlug || area)

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <PageHero
        backgroundImage="/images/prestataire.jpeg"
        backgroundPosition="center"
        title="Réseau de prestataires"
        description="Des partenaires qui accompagnent les élus dans leurs projets et leurs missions."
      />

      <Typography
        variant="lede"
        component="p"
        sx={{ mt: { xs: 2.5, md: 3 }, maxWidth: '68ch', color: 'text.secondary' }}
      >
        {INTRO}
      </Typography>

      <Box
        sx={{
          mt: { xs: 2.5, md: 3 },
          display: 'grid',
          gap: { xs: 1.5, md: 2 },
          pt: { xs: 2.5, md: 3 },
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
                    activeCategory ? ` de la catégorie « ${activeCategory.name} »` : ''
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
