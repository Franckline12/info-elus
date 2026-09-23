import type { Where } from 'payload'

import type { Article, Guide } from '@/payload-types'

import { getPayloadClient } from './payload'

/** Recherche globale sur les articles, l'actualité et les guides (§ 2.7). */

const PUBLISHED: Where = { _status: { equals: 'published' } }

const matching = (term: string): Where => ({
  or: [{ title: { like: term } }, { excerpt: { like: term } }],
})

export type SearchResults = {
  articles: Article[]
  guides: Guide[]
  total: number
}

export async function searchContent(term: string, limit = 10): Promise<SearchResults> {
  const trimmed = term.trim()

  if (trimmed.length < 2) return { articles: [], guides: [], total: 0 }

  const payload = await getPayloadClient()

  const [articles, guides] = await Promise.all([
    payload.find({
      collection: 'articles',
      where: { and: [PUBLISHED, matching(trimmed)] },
      sort: '-publishedAt',
      depth: 1,
      limit,
    }),
    payload.find({
      collection: 'guides',
      where: { and: [PUBLISHED, matching(trimmed)] },
      sort: '-publishedAt',
      depth: 1,
      limit,
    }),
  ])

  return {
    articles: articles.docs,
    guides: guides.docs,
    total: (articles.totalDocs ?? 0) + (guides.totalDocs ?? 0),
  }
}
