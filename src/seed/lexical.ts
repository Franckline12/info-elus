import type { Guide } from '../payload-types'

/**
 * Fabriques de contenu Lexical pour les scripts de seed.
 *
 * L'éditeur produit ces structures à la main dans l'admin ; ici on les écrit
 * directement, en s'en tenant aux nœuds activés par `contentEditor`.
 */

export type RichTextContent = Guide['sections'][number]['content']

type Node = { type: string; version: number; [k: string]: unknown }

const BASE = { format: '' as const, indent: 0, direction: 'ltr' as const, version: 1 }

export const text = (value: string, bold = false): Node => ({
  type: 'text',
  version: 1,
  text: value,
  // Le format des nœuds texte est un masque de bits : 1 = gras.
  format: bold ? 1 : 0,
  style: '',
  mode: 'normal',
  detail: 0,
})

export const paragraph = (...children: Node[]): Node => ({
  ...BASE,
  type: 'paragraph',
  textFormat: 0,
  children,
})

/** Paragraphe de texte simple, cas le plus courant. */
export const p = (value: string): Node => paragraph(text(value))

export const heading = (tag: 'h2' | 'h3' | 'h4', value: string): Node => ({
  ...BASE,
  type: 'heading',
  tag,
  children: [text(value)],
})

export const list = (items: string[], ordered = false): Node => ({
  ...BASE,
  type: 'list',
  listType: ordered ? 'number' : 'bullet',
  tag: ordered ? 'ol' : 'ul',
  start: 1,
  children: items.map((item, index) => ({
    ...BASE,
    type: 'listitem',
    value: index + 1,
    checked: undefined,
    children: [text(item)],
  })),
})

export const quote = (value: string): Node => ({
  ...BASE,
  type: 'quote',
  children: [text(value)],
})

/** Encadré éditorial : le block `callout` partagé par les articles et les guides. */
export const callout = (
  variant: 'info' | 'warning' | 'keyPoint',
  paragraphs: string[],
): Node => ({
  type: 'block',
  version: 2,
  format: '',
  fields: {
    blockType: 'callout',
    blockName: '',
    variant,
    content: richText(...paragraphs.map(p)),
  },
})

export const richText = (...children: Node[]): RichTextContent => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    direction: 'ltr',
    version: 1,
    children,
  },
})
