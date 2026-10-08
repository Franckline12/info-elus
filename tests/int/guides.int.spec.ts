import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import {
  getGuideBySlug,
  getGuides,
  getThemesWithGuideCount,
} from '@/lib/queries/guides'
import type { Guide, Theme } from '@/payload-types'

/**
 * Deux exigences se vérifient mal en isolation :
 * — aucun brouillon ne doit sortir de la couche de lecture (la Local API ignore
 *   les droits d'accès par défaut) ;
 * — les ancres de sections doivent rester uniques une fois passées par Payload,
 *   et pas seulement dans le hook pris isolément.
 */
describe('Guides : lectures publiques et ancres', () => {
  let payload: Payload
  let theme: Theme
  let emptyTheme: Theme
  const createdIds: number[] = []

  const SUFFIX = 'int-test-guides'

  const paragraph = {
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
  } as Guide['sections'][number]['content']

  const createGuide = async (data: {
    title: string
    slug: string
    status: 'draft' | 'published'
    headings: string[]
  }) => {
    const doc = await payload.create({
      collection: 'guides',
      draft: data.status === 'draft',
      context: { disableRevalidate: true },
      data: {
        title: data.title,
        slug: data.slug,
        summary: 'Résumé de test.',
        theme: theme.id,
        sections: data.headings.map((heading) => ({ heading, content: paragraph })),
        _status: data.status,
        publishedAt: '2026-01-01T00:00:00.000Z',
      },
    })
    createdIds.push(doc.id)
    return doc
  }

  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    theme = await payload.create({
      collection: 'themes',
      data: { name: `Thème ${SUFFIX}`, slug: `theme-${SUFFIX}`, color: 'blue-mid' },
    })

    emptyTheme = await payload.create({
      collection: 'themes',
      data: { name: `Thème vide ${SUFFIX}`, slug: `theme-vide-${SUFFIX}`, color: 'blue-mid' },
    })

    await createGuide({
      title: 'Guide publié',
      slug: `publie-${SUFFIX}`,
      status: 'published',
      headings: ['Les délais', 'Les délais', 'Le budget'],
    })

    await createGuide({
      title: 'Guide brouillon',
      slug: `brouillon-${SUFFIX}`,
      status: 'draft',
      headings: ['Les délais'],
    })
  })

  afterAll(async () => {
    if (createdIds.length > 0) {
      await payload.delete({
        collection: 'guides',
        where: { id: { in: createdIds } },
        context: { disableRevalidate: true },
      })
    }
    await payload.delete({
      collection: 'themes',
      where: { id: { in: [theme.id, emptyTheme.id] } },
    })
  })

  it('n’expose aucun brouillon dans les listes', async () => {
    const { docs } = await getGuides({ themeSlug: theme.slug ?? undefined })

    expect(docs.map((doc) => doc.slug)).toEqual([`publie-${SUFFIX}`])
  })

  it('renvoie null pour le slug d’un brouillon', async () => {
    await expect(getGuideBySlug(`brouillon-${SUFFIX}`)).resolves.toBeNull()
  })

  it('rend les ancres uniques à l’enregistrement', async () => {
    const guide = await getGuideBySlug(`publie-${SUFFIX}`)

    expect(guide?.sections.map((section) => section.anchor)).toEqual([
      'les-delais',
      'les-delais-2',
      'le-budget',
    ])
  })

  it('ne propose au filtre que les thèmes ayant au moins un guide publié', async () => {
    const themes = await getThemesWithGuideCount()
    const slugs = themes.map((item) => item.slug)

    expect(slugs).toContain(theme.slug)
    expect(slugs).not.toContain(emptyTheme.slug)
    expect(themes.find((item) => item.slug === theme.slug)?.guideCount).toBe(1)
  })
})
