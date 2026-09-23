import type { Metadata } from 'next'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import ArticleListItem from '@/components/article/ArticleListItem'
import FeaturedArticle from '@/components/article/FeaturedArticle'
import CategoryFilter from '@/components/CategoryFilter'
import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import PaginationLinks from '@/components/PaginationLinks'
import SectionHeading from '@/components/SectionHeading'
import { getArticles, getFeaturedNews } from '@/lib/queries/articles'
import { getCategories } from '@/lib/queries/categories'
import { rule } from '@/theme/tokens'

const PER_PAGE = 10

export const metadata: Metadata = {
  title: 'Actualité',
  description:
    'Le fil d’actualité juridique et sociale du CSE : jurisprudence, réformes et décisions qui changent le quotidien des élus.',
}

type Props = {
  searchParams: Promise<{ categorie?: string; page?: string }>
}

const parsePage = (value?: string): number => {
  const page = Number.parseInt(value ?? '1', 10)
  return Number.isNaN(page) || page < 1 ? 1 : page
}

export default async function ActualitePage({ searchParams }: Props) {
  const { categorie, page: pageParam } = await searchParams
  const page = parsePage(pageParam)

  // Le grand format n'ouvre que la première page, et sans filtre de catégorie :
  // au-delà, la page est un simple fil chronologique.
  const showFeatured = page === 1 && !categorie
  const featured = showFeatured ? await getFeaturedNews() : null

  const [result, categories] = await Promise.all([
    getArticles({
      type: 'news',
      categorySlug: categorie,
      page,
      limit: PER_PAGE,
      excludeIds: featured ? [featured.id] : [],
    }),
    getCategories(),
  ])

  const activeCategory = categories.find((category) => category.slug === categorie)
  const isEmpty = !featured && result.docs.length === 0

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <Box component="header" sx={{ mb: 4 }}>
        <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
          Actualité
        </Typography>
        <Typography variant="lede" component="p" sx={{ color: 'text.secondary', maxWidth: '58ch' }}>
          Jurisprudence, réformes et décisions qui changent le quotidien des élus.
        </Typography>
      </Box>

      <CategoryFilter type="news" categories={categories} activeSlug={categorie} />

      {isEmpty ? (
        <EmptyState
          title="Aucune actualité pour le moment"
          description={
            activeCategory
              ? `Aucune actualité publiée dans la catégorie « ${activeCategory.name} ».`
              : 'Le fil d’actualité sera alimenté prochainement.'
          }
        />
      ) : null}

      {featured ? (
        <Box component="section" aria-label="À la une de l’actualité" sx={{ mb: { xs: 5, md: 7 } }}>
          <FeaturedArticle article={featured} />
        </Box>
      ) : null}

      {result.docs.length > 0 ? (
        <Box component="section" aria-labelledby="fil-actualite">
          {featured ? <SectionHeading id="fil-actualite" title="Le fil" /> : null}

          <Box sx={{ display: 'grid', gap: { xs: 4, md: 5 } }}>
            {result.docs.map((article, index) => (
              <Box
                key={article.id}
                sx={
                  index > 0 ? { borderTop: `1px solid ${rule}`, pt: { xs: 4, md: 5 } } : undefined
                }
              >
                <ArticleListItem article={article} />
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}

      <PaginationLinks
        type="news"
        page={result.page ?? 1}
        totalPages={result.totalPages}
        categorySlug={categorie}
      />
    </Container>
  )
}
