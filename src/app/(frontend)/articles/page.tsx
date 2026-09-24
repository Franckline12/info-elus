import type { Metadata } from 'next'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'
import ArticleCard from '@/components/article/ArticleCard'
import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import PageHero from '@/components/PageHero'
import PaginationLinks from '@/components/PaginationLinks'
import SearchBar from '@/components/SearchBar'
import { taxonomyOptions } from '@/lib/filterOptions'
import { countArticlesByCategory, getArticles } from '@/lib/queries/articles'
import { getCategories } from '@/lib/queries/categories'
import { getTags } from '@/lib/queries/tags'
import { listingPagePath, listingPath } from '@/lib/routes'

const PER_PAGE = 9

export const metadata: Metadata = {
  title: 'Articles',
  description:
    'Décryptages juridiques et analyses de fond pour les élus de CSE : négociation, santé et sécurité, budget, élections.',
}

type Props = {
  searchParams: Promise<{ categorie?: string; tag?: string; q?: string; page?: string }>
}

const parsePage = (value?: string): number => {
  const page = Number.parseInt(value ?? '1', 10)
  return Number.isNaN(page) || page < 1 ? 1 : page
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { categorie, tag, q, page: pageParam } = await searchParams
  const page = parsePage(pageParam)

  const [result, categories, tags, counts] = await Promise.all([
    getArticles({
      type: 'article',
      categorySlug: categorie,
      tagSlug: tag,
      search: q,
      page,
      limit: PER_PAGE,
    }),
    getCategories(),
    getTags(),
    countArticlesByCategory({ type: 'article', tagSlug: tag, search: q }),
  ])

  const activeCategory = categories.find((category) => category.slug === categorie)
  const activeTag = tags.find((item) => item.slug === tag)

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <PageHero
        backgroundImage="/images/articles.jpeg"
        title="Articles"
        description="Décryptages juridiques et analyses de fond pour exercer son mandat en connaissance de cause."
      />

      <Box sx={{ mt: { xs: 2.5, md: 3 } }}>
        <SearchBar
          action={listingPath('article')}
          label="Rechercher un article"
          placeholder="Rechercher un article…"
          defaultValue={q}
          filters={[
            {
              name: 'categorie',
              label: 'Filtrer par catégorie',
              allLabel: 'Toutes les catégories',
              allCount: counts.total,
              value: categorie,
              options: taxonomyOptions(categories, counts),
            },
          ]}
          hidden={{ tag }}
          resultLabel={`${result.totalDocs} article${result.totalDocs > 1 ? 's' : ''}`}
        />
      </Box>

      {activeTag ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
          Filtre actif : #{activeTag.name}{' '}
          <AppLink href={listingPagePath('article')} sx={{ ml: 1 }}>
            Retirer le filtre
          </AppLink>
        </Typography>
      ) : null}

      <Box sx={{ mt: { xs: 3, md: 4 } }}>
        {result.docs.length === 0 ? (
          <EmptyState
            title="Aucun article pour le moment"
            description={
              q
                ? `Aucun article ne correspond à « ${q} ».`
                : activeCategory
                  ? `Aucun article publié dans la catégorie « ${activeCategory.name} ».`
                  : activeTag
                    ? `Aucun article publié avec le tag « ${activeTag.name} ».`
                    : 'Les premiers décryptages seront publiés prochainement.'
            }
          />
        ) : (
          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            {result.docs.map((article, index) => (
              <Grid key={article.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ArticleCard article={article} priority={index < 3} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <PaginationLinks
        type="article"
        page={result.page ?? 1}
        totalPages={result.totalPages}
        categorySlug={categorie}
        tagSlug={tag}
      />
    </Container>
  )
}
