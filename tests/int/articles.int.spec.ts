import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { getArticleBySlug, getArticles, getFeaturedNews } from '@/lib/queries/articles'
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
        publishedAt: '2026-01-01T00:00:00.000Z',
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
})
