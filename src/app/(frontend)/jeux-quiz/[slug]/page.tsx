import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Box from '@mui/material/Box'

import Breadcrumb from '@/components/Breadcrumb'
import Container from '@/components/Container'
import PageHero from '@/components/PageHero'
import QuizRunner from '@/components/quiz/QuizRunner'
import { getPublishedQuizSlugs, getQuizBySlug } from '@/lib/queries/quizzes'
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
  const quiz = await getQuizBySlug(slug)

  if (!quiz) return { title: 'Page introuvable' }

  return { title: quiz.title, description: quiz.excerpt }
}

export default async function QuizPage({ params }: Props) {
  const { slug } = await params
  const quiz = await getQuizBySlug(slug)

  if (!quiz) notFound()

  return (
    <Container sx={{ py: { xs: 3, md: 4 } }}>
      <PageHero tone="quiz" title={quiz.title} description={quiz.excerpt} />

      <Box sx={{ mt: { xs: 2, md: 2.5 } }}>
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Jeux & Quiz', href: quizzesPath },
            { label: quiz.title },
          ]}
        />
      </Box>

      <Box sx={{ mt: { xs: 2.5, md: 3 } }}>
        <QuizRunner quiz={quiz} />
      </Box>
    </Container>
  )
}
