import { formatSlug } from '@/hooks/formatSlug'
import type { Article, Guide } from '@/payload-types'

export type TocEntry = {
  id: string
  label: string
  level: 2 | 3
}

type UnknownNode = { type?: unknown; tag?: unknown; text?: unknown; children?: unknown }

/** Concatène le texte d'un nœud Lexical et de sa descendance. */
const textOf = (node: UnknownNode): string => {
  if (typeof node.text === 'string') return node.text
  if (!Array.isArray(node.children)) return ''
  return node.children.map((child) => textOf(child as UnknownNode)).join('')
}

/**
 * Ancre d'un titre de corps d'article. Partagée par le sommaire et par le rendu
 * du contenu (`RichText`) : les deux doivent produire exactement le même `id`.
 */
export const headingId = (label: string): string => `section-${formatSlug(label)}`

/**
 * Sommaire « Dans cet article » déduit des titres h2/h3 du corps Lexical.
 * Aucun champ CMS supplémentaire n'est nécessaire.
 */
export function extractToc(content: Article['content']): TocEntry[] {
  const children = content?.root?.children

  if (!Array.isArray(children)) return []

  const entries: TocEntry[] = []

  for (const child of children as UnknownNode[]) {
    if (child?.type !== 'heading') continue
    if (child.tag !== 'h2' && child.tag !== 'h3') continue

    const label = textOf(child).trim()
    if (!label) continue

    entries.push({ id: headingId(label), label, level: child.tag === 'h2' ? 2 : 3 })
  }

  return entries
}

/**
 * Sommaire d'un guide : contrairement aux articles, la structure est explicite
 * dans le CMS. Chaque section porte son ancre, rendue unique à l'enregistrement
 * (`uniqueSectionAnchors`) — aucune déduction n'est nécessaire ici.
 */
export function guideToc(sections: Guide['sections']): TocEntry[] {
  return (sections ?? [])
    .filter((section) => Boolean(section.anchor) && Boolean(section.heading))
    .map((section) => ({
      id: section.anchor as string,
      label: section.heading,
      level: 2 as const,
    }))
}
