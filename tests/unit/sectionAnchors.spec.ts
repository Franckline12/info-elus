import { describe, expect, it } from 'vitest'

import type { AnchoredSection } from '@/hooks/sectionAnchors'
import { uniqueSectionAnchors, withUniqueAnchors } from '@/hooks/sectionAnchors'

const anchorsOf = (headings: string[]): (string | null | undefined)[] => {
  const sections: AnchoredSection[] = headings.map((heading) => ({ heading }))
  return withUniqueAnchors(sections).map((section) => section.anchor)
}

/** Le hook reçoit tout le contexte Payload ; seul `data` nous intéresse ici. */
const runHook = (data: Record<string, unknown>) =>
  uniqueSectionAnchors({ data } as Parameters<typeof uniqueSectionAnchors>[0]) as Record<
    string,
    unknown
  >

describe('withUniqueAnchors', () => {
  it('dérive l’ancre du titre de section', () => {
    expect(anchorsOf(['Les délais', 'Santé & sécurité'])).toEqual([
      'les-delais',
      'sante-securite',
    ])
  })

  it('suffixe les ancres en double plutôt que de les laisser entrer en collision', () => {
    expect(anchorsOf(['Les délais', 'Les délais', 'Les délais'])).toEqual([
      'les-delais',
      'les-delais-2',
      'les-delais-3',
    ])
  })

  it('n’écrase pas une ancre déjà prise par un titre qui porte le même suffixe', () => {
    // « Les délais 2 » produit naturellement `les-delais-2`, déjà attribué au
    // doublon précédent : la troisième section doit céder la place.
    expect(anchorsOf(['Les délais', 'Les délais', 'Les délais 2'])).toEqual([
      'les-delais',
      'les-delais-2',
      'les-delais-2-2',
    ])
  })

  it('retombe sur la position quand le titre ne produit aucun slug', () => {
    expect(anchorsOf(['', '???'])).toEqual(['section-1', 'section-2'])
  })

  it('recalcule l’ancre quand le titre change', () => {
    const [section] = withUniqueAnchors<AnchoredSection>([
      { heading: 'Le budget', anchor: 'les-delais' },
    ])

    expect(section.anchor).toBe('le-budget')
  })

  it('est idempotent : réappliqué, il ne déplace pas les ancres', () => {
    const once = withUniqueAnchors<AnchoredSection>([
      { heading: 'Les délais' },
      { heading: 'Les délais' },
      { heading: 'Le budget' },
    ])

    expect(withUniqueAnchors(once)).toEqual(once)
  })
})

describe('uniqueSectionAnchors', () => {
  it('renseigne les ancres du document', () => {
    const result = runHook({
      title: 'Guide',
      sections: [{ heading: 'Les délais' }, { heading: 'Les délais' }],
    })

    const sections = result.sections as AnchoredSection[]

    expect(sections.map((section) => section.anchor)).toEqual(['les-delais', 'les-delais-2'])
  })

  it('laisse passer une mise à jour partielle qui ne porte pas sur les sections', () => {
    const data = { title: 'Guide' }

    expect(runHook(data)).toBe(data)
  })
})
