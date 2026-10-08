import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import {
  getArticleBySlug,
  getArticles,
  getFeaturedNews,
  getLatestNews,
} from '@/lib/queries/articles'
import type { Category } from '@/payload-types'

/**
 * Garde-fou sur l'exigence la plus sensible de la couche de lecture : la Local
 * API ignore les droits d'accès par défaut, donc un oubli de filtre publierait
 * des brouillons sur le site.
 */
describe('Lectures publiques des articles', () => {
  let payload: Payload
  let category: Category
  const createdIds: number[] = []

  const SUFFIX = 'int-test-articles'

  const createArticle = async (data: {
    title: string
    slug: string
    type: 'article' | 'news'
    status: 'draft' | 'published'
    publishedAt?: string
  }) => {
    const doc = await payload.create({
      collection: 'articles',
      draft: data.status === 'draft',
      context: { disableRevalidate: true },
      data: {
        title: data.title,
        excerpt: 'Contenu de test.',
        content: {
          root: {
            type: 'root',
            version: 1,
            format: '',
            indent: 0,
            direction: 'ltr',
            children: [
              {
                type: 'paragraph',
                version: 1,
                format: '',
                indent: 0,
                direction: 'ltr',
                textFormat: 0,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: 'Corps de test.',
                    format: 0,
                    style: '',
                    mode: 'normal',
                    detail: 0,
                  },
                ],
              },
            ],
          },
        } as never,
        category: category.id,
        slug: data.slug,
        type: data.type,
        _status: data.status,
        publishedAt: data.publishedAt ?? '2026-01-01T00:00:00.000Z',
      },
    })
    createdIds.push(doc.id)
    return doc
  }

  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    category = await payload.create({
      collection: 'categories',
      data: { name: `Catégorie ${SUFFIX}`, slug: `categorie-${SUFFIX}` },
    })

    await createArticle({
      title: 'Publié',
      slug: `publie-${SUFFIX}`,
      type: 'article',
      status: 'published',
    })
    await createArticle({
      title: 'Brouillon',
      slug: `brouillon-${SUFFIX}`,
      type: 'article',
      status: 'draft',
    })
    await createArticle({
      title: 'Actualité brouillon',
      slug: `actu-brouillon-${SUFFIX}`,
      type: 'news',
      status: 'draft',
    })
    await createArticle({
      title: 'Actualité ancienne',
      slug: `actu-ancienne-${SUFFIX}`,
      type: 'news',
      status: 'published',
      publishedAt: '2026-01-01T00:00:00.000Z',
    })
    await createArticle({
      title: 'Actualité récente',
      slug: `actu-recente-${SUFFIX}`,
      type: 'news',
      status: 'published',
      publishedAt: '2026-06-01T00:00:00.000Z',
    })
  })

  afterAll(async () => {
    if (createdIds.length > 0) {
      await payload.delete({
        collection: 'articles',
        where: { id: { in: createdIds } },
        context: { disableRevalidate: true },
      })
    }
    await payload.delete({ collection: 'categories', where: { id: { equals: category.id } } })
  })

  it('n’expose aucun brouillon dans les listes', async () => {
    const { docs } = await getArticles({
      type: 'article',
      categorySlug: category.slug ?? undefined,
    })

    expect(docs.map((doc) => doc.slug)).toEqual([`publie-${SUFFIX}`])
    expect(docs.every((doc) => doc._status === 'published')).toBe(true)
  })

  it('renvoie null pour le slug d’un brouillon', async () => {
    await expect(getArticleBySlug(`brouillon-${SUFFIX}`, 'article')).resolves.toBeNull()
  })

  it('renvoie null quand le type demandé ne correspond pas au document', async () => {
    await expect(getArticleBySlug(`publie-${SUFFIX}`, 'news')).resolves.toBeNull()
    await expect(getArticleBySlug(`publie-${SUFFIX}`, 'article')).resolves.not.toBeNull()
  })

  it('ne retient jamais un brouillon comme actualité en grand format', async () => {
    const featured = await getFeaturedNews()

    expect(featured?.slug).not.toBe(`actu-brouillon-${SUFFIX}`)
    if (featured) expect(featured._status).toBe('published')
  })

  it('n’expose que des actualités publiées dans le fil', async () => {
    const { docs } = await getLatestNews({ limit: 100 })
    const slugs = docs.map((doc) => doc.slug)

    expect(slugs).toContain(`actu-recente-${SUFFIX}`)
    expect(slugs).not.toContain(`actu-brouillon-${SUFFIX}`)
    // Le fil ne mélange jamais les articles de fond à l'actualité (§ 2.3).
    expect(docs.every((doc) => doc.type === 'news' && doc._status === 'published')).toBe(true)
  })

  it('écarte du fil l’actualité déjà affichée en grand format', async () => {
    const lead = await getArticleBySlug(`actu-recente-${SUFFIX}`, 'news')
    if (!lead) throw new Error('Fixture « actualité récente » introuvable.')

    const { docs } = await getLatestNews({ limit: 100, excludeId: lead.id })

    expect(docs.map((doc) => doc.slug)).not.toContain(`actu-recente-${SUFFIX}`)
  })

  it('trie le fil de la plus récente à la plus ancienne', async () => {
    const { docs } = await getLatestNews({ limit: 100 })
    const timestamps = docs.map((doc) => (doc.publishedAt ? Date.parse(doc.publishedAt) : 0))

    expect([...timestamps].sort((a, b) => b - a)).toEqual(timestamps)
  })

  it('pagine le fil : chaque page sert des documents différents', async () => {
    const [first, second] = await Promise.all([
      getLatestNews({ page: 1, limit: 1 }),
      getLatestNews({ page: 2, limit: 1 }),
    ])

    expect(first.docs).toHaveLength(1)
    expect(second.docs).toHaveLength(1)
    expect(first.docs[0].id).not.toBe(second.docs[0].id)
    expect(first.totalDocs).toBeGreaterThanOrEqual(2)
  })
})
