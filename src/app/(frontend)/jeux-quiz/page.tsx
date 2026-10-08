import type { Metadata } from 'next'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import PageHero from '@/components/PageHero'
import PaginationLinks from '@/components/PaginationLinks'
import FeaturedQuiz from '@/components/quiz/FeaturedQuiz'
import QuizCard from '@/components/quiz/QuizCard'
import QuizCounter from '@/components/quiz/QuizCounter'
import SectionHeading from '@/components/SectionHeading'
import { getQuizStats } from '@/lib/queries/quizStats'
import { getCurrentQuiz, getPastQuizzes } from '@/lib/queries/quizzes'
import { parsePage, quizzesPath } from '@/lib/routes'

/**
 * Listing des quiz (§ 2.5). Le quiz de la semaine est mis en avant, les autres
 * forment un historique paginé : à raison d'un quiz par semaine, tout afficher
 * d'un coup rendrait les plus anciens inatteignables au bout de quelques mois.
 *
 * Comme les listings d'articles, la page se rend à la demande dès lors qu'elle
 * lit `?page=` ; le compteur communautaire garde son propre cache de cinq
 * minutes, et les pages de jeu, elles, restent statiques.
 *
 * Tout est rendu côté serveur : seul le parcours de jeu, sur la page d'un quiz,
 * a besoin du navigateur.
 */

const PER_PAGE = 12

const description =
  'Testez vos connaissances sur le droit du travail et le fonctionnement du CSE, tout en vous amusant.'

type Props = {
  searchParams: Promise<{ page?: string }>
}

/** Les pages d'historique portent leur numéro : deux titres identiques se liraient comme un doublon. */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parsePage((await searchParams).page)

  return {
    title: page > 1 ? `Jeux & Quiz — page ${page}` : 'Jeux & Quiz',
    description,
    alternates: { canonical: quizzesPath },
  }
}

export default async function QuizzesPage({ searchParams }: Props) {
  const page = parsePage((await searchParams).page)

  const [current, stats] = await Promise.all([getCurrentQuiz(), getQuizStats()])

  // Le quiz mis en avant est écarté de l'historique sur toutes les pages, pas
  // seulement la première : sinon la pagination glisserait d'un cran.
  const history = await getPastQuizzes({
    page,
    limit: PER_PAGE,
    exceptId: current?.id ?? null,
  })

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <PageHero tone="quiz" title="Jeux & Quiz" description={description} />

      <Box sx={{ mt: { xs: 2.5, md: 3 } }}>
        <QuizCounter stats={stats} />
      </Box>

      {/* Le quiz de la semaine n'a sa place qu'en tête d'historique. */}
      {page === 1 ? (
        <Box sx={{ mt: { xs: 3, md: 4 } }}>
          {current ? (
            <Box component="section" aria-labelledby="quiz-de-la-semaine">
              <FeaturedQuiz quiz={current} id="quiz-de-la-semaine" />
            </Box>
          ) : (
            <EmptyState
              title="Aucun quiz publié"
              description="Le premier quiz hebdomadaire sera mis en ligne prochainement."
            />
          )}
        </Box>
      ) : null}

      {history.docs.length > 0 ? (
        <Box
          component="section"
          aria-labelledby="quiz-precedents"
          sx={{ mt: page === 1 ? { xs: 5, md: 7 } : { xs: 3, md: 4 } }}
        >
          <SectionHeading id="quiz-precedents" title="Les quiz précédents" />

          <Typography
            component="p"
            sx={{ mt: -1, mb: { xs: 2, md: 2.5 }, color: 'text.secondary', fontSize: '0.9375rem' }}
          >
            Tous restent jouables, autant de fois que vous le souhaitez.
          </Typography>

          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            {history.docs.map((quiz) => (
              <Grid key={quiz.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <QuizCard quiz={quiz} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : page > 1 ? (
        <Box sx={{ mt: { xs: 3, md: 4 } }}>
          <EmptyState
            title="Cette page d’historique est vide"
            description="Revenez à la première page pour retrouver les quiz publiés."
          />
        </Box>
      ) : null}

      <PaginationLinks basePath={quizzesPath} page={history.page} totalPages={history.totalPages} />
    </Container>
  )
}
