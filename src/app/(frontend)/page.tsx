import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

import ArticleCard from '@/components/article/ArticleCard'
import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import GuideCard from '@/components/guide/GuideCard'
import GuideRail from '@/components/guide/GuideRail'
import HomeHero from '@/components/home/HomeHero'
import SectionShortcuts from '@/components/home/SectionShortcuts'
import TestimonialCard from '@/components/home/TestimonialCard'
import NewsletterBlock from '@/components/NewsletterBlock'
import SectionHeading from '@/components/SectionHeading'
import VisuallyHidden from '@/components/VisuallyHidden'
import { getArticles, getFeaturedOnHome } from '@/lib/queries/articles'
import { getGuidesForHome } from '@/lib/queries/guides'
import { getTestimonial } from '@/lib/queries/testimonials'
import { guidesPath } from '@/lib/routes'
import { siteName, siteTagline } from '@/lib/site'

/** Page statique régénérée à la demande par les hooks des collections. */
export const revalidate = 3600

export default async function HomePage() {
  const [featured, guides, testimonial] = await Promise.all([
    getFeaturedOnHome(1),
    getGuidesForHome(8),
    getTestimonial(),
  ])

  // Le bandeau reprend l'article coché « À la une » ; sans cochage, le plus
  // récent fait l'ouverture — aucun contenu n'est fabriqué pour combler le vide.
  const heroFromFeatured = featured[0] ?? null

  const { docs: latestArticles } = await getArticles({
    type: 'article',
    limit: 4,
    excludeIds: heroFromFeatured ? [heroFromFeatured.id] : [],
  })

  const hero = heroFromFeatured ?? latestArticles[0] ?? null
  const recentArticles = (heroFromFeatured ? latestArticles : latestArticles.slice(1)).slice(0, 3)

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      {hero ? (
        <HomeHero article={hero} />
      ) : (
        <>
          <VisuallyHidden component="h1">{`${siteName} — ${siteTagline}`}</VisuallyHidden>
          <EmptyState
            title="Aucun article publié"
            description="Publiez un article depuis l’administration, puis cochez « À la une » pour l’afficher ici."
          />
        </>
      )}

      <Box sx={{ mt: { xs: 3, md: 4 } }}>
        <SectionShortcuts />
      </Box>

      {guides.length > 0 ? (
        <Box component="section" aria-labelledby="guides-cse" sx={{ mt: { xs: 5, md: 6 } }}>
          <SectionHeading
            id="guides-cse"
            title="Guides CSE"
            href={guidesPath}
            linkLabel="Voir tous les guides"
          />

          <GuideRail label="Guides CSE">
            {guides.map((guide, index) => (
              <GuideCard key={guide.id} guide={guide} priority={index < 2} />
            ))}
          </GuideRail>
        </Box>
      ) : null}

      {recentArticles.length > 0 ? (
        <Box component="section" aria-labelledby="articles-recents" sx={{ mt: { xs: 5, md: 6 } }}>
          <SectionHeading
            id="articles-recents"
            title="Articles récents"
            href="/articles"
            linkLabel="Voir tous les articles"
          />

          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            {recentArticles.map((article) => (
              <Grid key={article.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ArticleCard article={article} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : null}

      <Grid container spacing={{ xs: 2.5, md: 3 }} sx={{ mt: { xs: 5, md: 6 } }}>
        <Grid size={{ xs: 12, md: testimonial ? 8 : 12 }}>
          <NewsletterBlock />
        </Grid>
        {testimonial ? (
          <Grid size={{ xs: 12, md: 4 }}>
            <TestimonialCard testimonial={testimonial} />
          </Grid>
        ) : null}
      </Grid>
    </Container>
  )
}
