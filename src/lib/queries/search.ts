import type { Where } from 'payload'

import type { Article, Guide } from '@/payload-types'

import { getPayloadClient } from './payload'

/**
 * Recherche globale sur les articles de fond, l'actualité et les guides (§ 2.7).
 *
 * La collection `articles` abrite deux types de contenus différenciés par le
 * champ `type` : `'article'` (analyse de fond) et `'news'` (brève d'actualité).
 * Les deux sont cherchés séparément pour pouvoir les regrouper à l'affichage.
 */

const PUBLISHED: Where = { _status: { equals: 'published' } }

const matchArticles = (term: string, type: 'article' | 'news'): Where => ({
  and: [
    PUBLISHED,
    { type: { equals: type } },
    { or: [{ title: { like: term } }, { excerpt: { like: term } }] },
  ],
})

const matchGuides = (term: string): Where => ({
  and: [
    PUBLISHED,
    { or: [{ title: { like: term } }, { summary: { like: term } }] },
  ],
})

export type SearchResults = {
  /** Actualités (type = 'news') correspondant au terme. */
  news: Article[]
  /** Articles de fond (type = 'article') correspondant au terme. */
  articles: Article[]
  /** Guides correspondant au terme. */
  guides: Guide[]
  total: number
}

export async function searchContent(term: string, limit = 8): Promise<SearchResults> {
  const trimmed = term.trim()

  if (trimmed.length < 2) return { news: [], articles: [], guides: [], total: 0 }

  const payload = await getPayloadClient()

  const [news, articles, guides] = await Promise.all([
    payload.find({
      collection: 'articles',
      where: matchArticles(trimmed, 'news'),
      sort: '-publishedAt',
      depth: 1,
      limit,
    }),
    payload.find({
      collection: 'articles',
      where: matchArticles(trimmed, 'article'),
      sort: '-publishedAt',
      depth: 1,
      limit,
    }),
    payload.find({
      collection: 'guides',
      where: matchGuides(trimmed),
      sort: '-publishedAt',
      depth: 1,
      limit,
    }),
  ])

  return {
    news: news.docs,
    articles: articles.docs,
    guides: guides.docs,
    total: (news.totalDocs ?? 0) + (articles.totalDocs ?? 0) + (guides.totalDocs ?? 0),
  }
}

