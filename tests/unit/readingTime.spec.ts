import { describe, expect, it } from 'vitest'

import { calculateReadingTime } from '@/utilities/readingTime'

/** Construit un nœud texte Lexical. */
const text = (value: string) => ({ type: 'text', text: value, version: 1 })

/** Construit un paragraphe Lexical contenant `value`. */
const paragraph = (value: string) => ({
  type: 'paragraph',
  version: 1,
  children: [text(value)],
})

/** Construit une racine Lexical à partir de nœuds de premier niveau. */
const root = (children: unknown[]) => ({
  root: {
    type: 'root',
    version: 1,
    children,
  },
})

/** Génère un contenu de `count` mots répartis en paragraphes de 50 mots. */
const words = (count: number) => {
  const paragraphs = []

  for (let index = 0; index < count; index += 50) {
    paragraphs.push(
      paragraph(Array.from({ length: Math.min(50, count - index) }, () => 'mot').join(' ')),
    )
  }

  return root(paragraphs)
}

/** Construit un block Callout avec son contenu richText imbriqué. */
const callout = (value: string) => ({
  type: 'block',
  version: 2,
  fields: {
    id: '65f0a1b2c3d4e5f6a7b8c9d0',
    blockName: '',
    blockType: 'callout',
    variant: 'info',
    content: root([paragraph(value)]),
  },
})

describe('calculateReadingTime', () => {
  it('renvoie 1 minute pour un contenu vide', () => {
    expect(calculateReadingTime(root([]))).toBe(1)
    expect(calculateReadingTime(root([paragraph('   ')]))).toBe(1)
  })

  it('renvoie 1 minute pour un contenu court', () => {
    // 120 mots < 200 mots/minute, arrondi au supérieur puis plancher à 1
    expect(calculateReadingTime(words(120))).toBe(1)
  })

  it('arrondit au supérieur pour un contenu long', () => {
    expect(calculateReadingTime(words(400))).toBe(2)
    // 401 mots : la minute entamée compte
    expect(calculateReadingTime(words(401))).toBe(3)
  })

  it('compte le texte des encadrés Callout, pas leurs métadonnées', () => {
    // 200 mots de corps + 200 mots d'encadré = 2 minutes.
    // Si `variant`, `blockType` ou `id` étaient comptés, on obtiendrait 3.
    const content = root([
      ...words(200).root.children,
      callout(Array.from({ length: 200 }, () => 'mot').join(' ')),
    ])

    expect(calculateReadingTime(content)).toBe(2)
  })
})
