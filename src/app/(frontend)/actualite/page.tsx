import type { Metadata } from 'next'
import Box from '@mui/material/Box'

import FeaturedArticle from '@/components/article/FeaturedArticle'
import NewsFeed from '@/components/article/NewsFeed'
import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import PageHero from '@/components/PageHero'
import PaginationLinks from '@/components/PaginationLinks'
import SectionHeading from '@/components/SectionHeading'
import { getFeaturedNews, getLatestNews } from '@/lib/queries/articles'
import { listingPath, newsPagePath, parsePage } from '@/lib/routes'
import { absoluteUrl, siteName } from '@/lib/site'

const PER_PAGE = 10

const HERO_TITLE = 'Toute l’actualité CSE'

const DESCRIPTION =
  'Le fil d’actualité juridique et sociale du CSE : jurisprudence, réformes et décisions qui changent le quotidien des élus.'

/**
 * Le fil ne reçoit qu'un numéro de page : pas de filtre par catégorie ni par tag.
 * Une actualité se lit dans l'ordre chronologique — les filtres de taxonomie sont
 * portés par `/articles` (§ 2.1 et § 2.3).
 */
type Props = {
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page: pageParam } = await searchParams
  const page = parsePage(pageParam)
  const url = absoluteUrl(newsPagePath(page))

  // Chaque page du fil porte son propre titre et sa propre canonique : les pages
  // suivantes ne sont pas des doublons de la première aux yeux des moteurs.
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

  // L'actualité du grand format est écartée du fil sur toutes les pages, et pas
  // seulement sur la première : sans cela, la fenêtre de pagination se décalerait
  // d'un cran à partir de la page 2 et un contenu passerait à la trappe.
  const featured = await getFeaturedNews()
  const feed = await getLatestNews({ page, limit: PER_PAGE, excludeId: featured?.id })

  // Le grand format n'ouvre que la première page : au-delà, la liste seule suffit.
  const lead = page === 1 ? featured : null
  const isEmpty = featured === null && feed.docs.length === 0

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
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
            <SectionHeading
              id="fil-actualite"
              title={lead ? 'Les autres actualités' : 'Le fil d’actualité'}
            />

            <NewsFeed articles={feed.docs} />
          </Box>
        ) : null}
      </Box>

      <PaginationLinks
        basePath={listingPath('news')}
        page={feed.page ?? 1}
        totalPages={feed.totalPages}
      />
    </Container>
  )
}
