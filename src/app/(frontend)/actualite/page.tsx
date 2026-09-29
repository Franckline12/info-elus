import type { Metadata } from 'next'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'
import ArticleListItem from '@/components/article/ArticleListItem'
import FeaturedArticle from '@/components/article/FeaturedArticle'
import CategoryFilter from '@/components/CategoryFilter'
import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import PageHero from '@/components/PageHero'
import PaginationLinks from '@/components/PaginationLinks'
import PanelCard from '@/components/PanelCard'
import SectionHeading from '@/components/SectionHeading'
import TagList from '@/components/TagList'
import { getArticles, getFeaturedNews } from '@/lib/queries/articles'
import { getCategories } from '@/lib/queries/categories'
import { getTags } from '@/lib/queries/tags'
import { listingPagePath, listingPath, parsePage, tagPath } from '@/lib/routes'

const PER_PAGE = 10

export const metadata: Metadata = {
  title: 'Actualité',
  description:
    'Le fil d’actualité juridique et sociale du CSE : jurisprudence, réformes et décisions qui changent le quotidien des élus.',
}

type Props = {
  searchParams: Promise<{ categorie?: string; tag?: string; page?: string }>
}

export default async function ActualitePage({ searchParams }: Props) {
  const { categorie, tag, page: pageParam } = await searchParams
  const page = parsePage(pageParam)

  // Le grand format n'ouvre que la première page, et sans filtre actif :
  // au-delà, la page est un simple fil chronologique.
  const showFeatured = page === 1 && !categorie && !tag
  const featured = showFeatured ? await getFeaturedNews() : null

  const [result, categories, tags] = await Promise.all([
    getArticles({
      type: 'news',
      categorySlug: categorie,
      tagSlug: tag,
      page,
      limit: PER_PAGE,
      excludeIds: featured ? [featured.id] : [],
    }),
    getCategories(),
    getTags(),
  ])

  const activeCategory = categories.find((category) => category.slug === categorie)
  const activeTag = tags.find((item) => item.slug === tag)
  const isEmpty = !featured && result.docs.length === 0

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <PageHero
        title="Toute l’actualité CSE"
        description="Les dernières informations juridiques, sociales et pratiques pour les élus du CSE."
      />

      <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mt: { xs: 1, md: 1.5 } }}>
        <Grid size={{ xs: 12, md: 8 }}>
          {activeTag || activeCategory ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Filtre actif : {activeTag ? `#${activeTag.name}` : activeCategory?.name}{' '}
              <AppLink href={listingPagePath('news')} sx={{ ml: 1 }}>
                Retirer le filtre
              </AppLink>
            </Typography>
          ) : null}

          {isEmpty ? (
            <EmptyState
              title="Aucune actualité pour le moment"
              description={
                activeCategory
                  ? `Aucune actualité publiée dans la catégorie « ${activeCategory.name} ».`
                  : activeTag
                    ? `Aucune actualité publiée avec le tag « ${activeTag.name} ».`
                    : 'Le fil d’actualité sera alimenté prochainement.'
              }
            />
          ) : null}

          {featured ? (
            <Box
              component="section"
              aria-label="À la une de l’actualité"
              sx={{ mb: { xs: 4, md: 5 } }}
            >
              <FeaturedArticle article={featured} />
            </Box>
          ) : null}

          {result.docs.length > 0 ? (
            <Box component="section" aria-labelledby="fil-actualite">
              <SectionHeading
                id="fil-actualite"
                title={featured ? 'Les autres actualités' : 'Le fil d’actualité'}
              />

              <Card>
                <Box sx={{ px: { xs: 2, md: 2.5 } }}>
                  {result.docs.map((article, index) => (
                    <Box key={article.id}>
                      {index > 0 ? <Divider /> : null}
                      <Box sx={{ py: { xs: 2, md: 2.5 } }}>
                        <ArticleListItem article={article} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Box>
          ) : null}

          <PaginationLinks
            basePath={listingPath('news')}
            page={result.page ?? 1}
            totalPages={result.totalPages}
            params={{ categorie, tag }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'grid', gap: { xs: 2, md: 2.5 } }}>
            <PanelCard title="Filtrer par catégorie" id="filtre-categorie">
              <CategoryFilter
                type="news"
                categories={categories}
                activeSlug={categorie}
                layout="stacked"
              />
            </PanelCard>

            {tags.length > 0 ? (
              <PanelCard title="Tags populaires" id="tags-populaires">
                <TagList
                  tags={tags}
                  variant="filled"
                  hash
                  label="Filtrer par tag"
                  hrefFor={(item) => tagPath('news', item.slug ?? '')}
                />
              </PanelCard>
            ) : null}
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}
