import type { Metadata } from 'next'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

import Container from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import PageHero from '@/components/PageHero'
import QuizCard from '@/components/quiz/QuizCard'
import QuizRunner from '@/components/quiz/QuizRunner'
import SectionHeading from '@/components/SectionHeading'
import { getQuizzes } from '@/lib/queries/quizzes'

/** Page statique régénérée à la demande par les hooks de la collection Quiz. */
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Jeux & Quiz',
  description:
    'Testez vos connaissances sur le droit du travail et le fonctionnement du CSE, tout en vous amusant.',
}

export default async function QuizzesPage() {
  const { docs } = await getQuizzes(13)

  const [current, ...previous] = docs

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <PageHero
        tone="quiz"
        title="Jeux & Quiz"
        description="Testez vos connaissances sur le droit du travail et le fonctionnement du CSE, tout en vous amusant."
      />

      <Box sx={{ mt: { xs: 3, md: 4 } }}>
        {current ? (
          <Box component="section" aria-labelledby="quiz-de-la-semaine">
            <SectionHeading id="quiz-de-la-semaine" title={current.title} />
            <QuizRunner quiz={current} />
          </Box>
        ) : (
          <EmptyState
            title="Aucun quiz publié"
            description="Le premier quiz hebdomadaire sera mis en ligne prochainement."
          />
        )}
      </Box>

      {previous.length > 0 ? (
        <Box component="section" aria-labelledby="quiz-precedents" sx={{ mt: { xs: 5, md: 7 } }}>
          <SectionHeading id="quiz-precedents" title="Les quiz précédents" />
          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            {previous.map((quiz) => (
              <Grid key={quiz.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <QuizCard quiz={quiz} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : null}
    </Container>
  )
}
