import type { Metadata } from 'next'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import ArticleCard from '@/components/article/ArticleCard'
import CategoryFilter from '@/components/CategoryFilter'
import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import PaginationLinks from '@/components/PaginationLinks'
import { getArticles } from '@/lib/queries/articles'
import { getCategories } from '@/lib/queries/categories'
import { rule } from '@/theme/tokens'

const PER_PAGE = 9

export const metadata: Metadata = {
  title: 'Articles',
  description:
    'Décryptages juridiques et analyses de fond pour les élus de CSE : négociation, santé et sécurité, budget, élections.',
}

type Props = {
  searchParams: Promise<{ categorie?: string; page?: string }>
}

const parsePage = (value?: string): number => {
  const page = Number.parseInt(value ?? '1', 10)
  return Number.isNaN(page) || page < 1 ? 1 : page
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { categorie, page: pageParam } = await searchParams
  const page = parsePage(pageParam)

  const [result, categories] = await Promise.all([
    getArticles({ type: 'article', categorySlug: categorie, page, limit: PER_PAGE }),
    getCategories(),
  ])

  const activeCategory = categories.find((category) => category.slug === categorie)

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <Box component="header" sx={{ mb: 4 }}>
        <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
          Articles
        </Typography>
        <Typography variant="lede" component="p" sx={{ color: 'text.secondary', maxWidth: '58ch' }}>
          Décryptages juridiques et analyses de fond pour exercer son mandat en connaissance de
          cause.
        </Typography>
      </Box>

      <CategoryFilter type="article" categories={categories} activeSlug={categorie} />

      {result.docs.length === 0 ? (
        <EmptyState
          title="Aucun article pour le moment"
          description={
            activeCategory
              ? `Aucun article publié dans la catégorie « ${activeCategory.name} ».`
              : 'Les premiers articles seront publiés prochainement.'
          }
        />
      ) : (
        <Grid container spacing={{ xs: 4, md: 5 }}>
          {result.docs.map((article, index) => (
            <Grid
              key={article.id}
              size={{ xs: 12, sm: 6, md: 4 }}
              sx={{ borderTop: `1px solid ${rule}`, pt: 3 }}
            >
              <ArticleCard article={article} priority={index < 3} />
            </Grid>
          ))}
        </Grid>
      )}

      <PaginationLinks
        type="article"
        page={result.page ?? 1}
        totalPages={result.totalPages}
        categorySlug={categorie}
      />
    </Container>
  )
}
