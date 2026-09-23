import type { PaginatedDocs, Where } from 'payload'

import type { Quiz } from '@/payload-types'

import { getPayloadClient } from './payload'

/** Lectures publiques de la collection Quiz (§ 2.5). */

const PUBLISHED: Where = { _status: { equals: 'published' } }
const SORT_BY_DATE = '-publishedAt'

export async function getQuizzes(limit = 12, page = 1): Promise<PaginatedDocs<Quiz>> {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'quizzes',
    where: PUBLISHED,
    sort: SORT_BY_DATE,
    depth: 1,
    page,
    limit,
  })
}

/** Quiz de la semaine : le plus récemment publié. */
export async function getCurrentQuiz(): Promise<Quiz | null> {
  const { docs } = await getQuizzes(1)
  return docs[0] ?? null
}

export async function getQuizBySlug(slug: string): Promise<Quiz | null> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'quizzes',
    where: { and: [PUBLISHED, { slug: { equals: slug } }] },
    depth: 1,
    limit: 1,
  })

  return docs[0] ?? null
}

export async function getPublishedQuizSlugs(): Promise<string[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'quizzes',
    where: PUBLISHED,
    depth: 0,
    limit: 1000,
    pagination: false,
    select: { slug: true },
  })

  return docs.map((doc) => doc.slug).filter((slug): slug is string => Boolean(slug))
}
