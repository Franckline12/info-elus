import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Box from '@mui/material/Box'

import Breadcrumb from '@/components/Breadcrumb'
import Container from '@/components/Container'
import PageHero from '@/components/PageHero'
import QuizCounter from '@/components/quiz/QuizCounter'
import QuizRunner from '@/components/quiz/QuizRunner'
import { getQuizStatsFor } from '@/lib/queries/quizStats'
import { getPastQuizzes, getPlayableQuizBySlug, getPublishedQuizSlugs } from '@/lib/queries/quizzes'
import { quizzesPath } from '@/lib/routes'

export const revalidate = 3600
export const dynamicParams = true

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getPublishedQuizSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const quiz = await getPlayableQuizBySlug(slug)

  if (!quiz) return { title: 'Page introuvable' }

  return { title: quiz.title, description: quiz.intro ?? undefined }
}

export default async function QuizPage({ params }: Props) {
  const { slug } = await params

  // Projection expurgée : la page ne reçoit ni les bonnes réponses, ni les
  // explications (§ 2.5 — elles seraient lisibles dans le code source).
  const quiz = await getPlayableQuizBySlug(slug)

  if (!quiz) notFound()

  // Proposition de fin de parcours : le quiz publié le plus récent, celui-ci mis
  // à part. Seuls le titre et le slug partent dans le navigateur.
  const [stats, { docs }] = await Promise.all([
    getQuizStatsFor(quiz.id),
    getPastQuizzes({ limit: 1, exceptId: quiz.id }),
  ])

  const nextQuiz = docs[0] ?? null

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <PageHero tone="quiz" title={quiz.title} description={quiz.intro ?? undefined} />

      <Box sx={{ mt: { xs: 2, md: 2.5 } }}>
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Jeux & Quiz', href: quizzesPath },
            { label: quiz.title },
          ]}
        />
      </Box>

      <Box sx={{ mt: { xs: 2, md: 2.5 } }}>
        <QuizCounter stats={stats} scope="quiz" />
      </Box>

      <Box sx={{ mt: { xs: 2.5, md: 3 } }}>
        <QuizRunner
          quiz={quiz}
          nextQuiz={nextQuiz ? { slug: nextQuiz.slug, title: nextQuiz.title } : null}
        />
      </Box>
    </Container>
  )
}
