import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import type { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical'
import { LinkJSXConverter, RichText as PayloadRichText } from '@payloadcms/richtext-lexical/react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

import type { CalloutBlock, Media } from '@/payload-types'
import { articlePath } from '@/lib/routes'
import { headingId } from '@/lib/toc'
import { colors, fonts, measure, radius, rule } from '@/theme/tokens'

import AppLink from './AppLink'
import Callout from './Callout'

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<CalloutBlock>

/** Correspondance titre Lexical → variante typographique du thème. */
const HEADING_VARIANTS = {
  // H1 est réservé au titre de la page : jamais émis par l'éditeur.
  h1: { variant: 'h2', mt: 6, mb: 2 },
  h2: { variant: 'h2', mt: 6, mb: 2 },
  h3: { variant: 'h3', mt: 4.5, mb: 1.5 },
  h4: { variant: 'h4', mt: 3.5, mb: 1 },
  h5: { variant: 'h5', mt: 3, mb: 1 },
  h6: { variant: 'h6', mt: 3, mb: 1 },
} as const

/**
 * Résolution des liens internes : le type du document cible détermine sa route
 * (`/articles/…` ou `/actualite/…`).
 */
const internalDocToHref = ({
  linkNode,
}: {
  linkNode: { fields: { doc?: { value: unknown } | null } }
}): string => {
  const value = linkNode.fields.doc?.value

  if (value && typeof value === 'object' && 'slug' in value && 'type' in value) {
    return articlePath(value as { slug?: string | null; type: 'article' | 'news' })
  }

  // Document non peuplé (profondeur insuffisante) : on renvoie vers le listing
  // plutôt que de produire un lien mort.
  return '/articles'
}

/** Texte brut d'un titre, pour en dériver l'ancre. */
const headingText = (nodes: unknown): string => {
  if (!Array.isArray(nodes)) return ''

  return nodes
    .map((node) => {
      const candidate = node as { text?: unknown; children?: unknown }
      if (typeof candidate.text === 'string') return candidate.text
      return headingText(candidate.children)
    })
    .join('')
}

const converters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),

  heading: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    const { variant, mt, mb } = HEADING_VARIANTS[node.tag] ?? HEADING_VARIANTS.h3

    // Même ancre que celle calculée par le sommaire (`extractToc`).
    const label = headingText(node.children).trim()
    const id = label ? headingId(label) : undefined

    return (
      <Typography
        id={id}
        variant={variant}
        component={node.tag}
        sx={{ mt, mb, scrollMarginTop: 24 }}
      >
        {children}
      </Typography>
    )
  },

  paragraph: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })

    // Paragraphe vide : l'éditeur s'en sert comme respiration, pas comme contenu.
    if (!children?.length) return null

    return (
      <Typography variant="body1" component="p" sx={{ my: 2.5 }}>
        {children}
      </Typography>
    )
  },

  quote: ({ node, nodesToJSX }) => (
    <Box
      component="blockquote"
      sx={{
        my: 4,
        mx: 0,
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 2.5 },
        backgroundColor: colors.bluePale,
        borderLeft: `3px solid ${colors.blueBright}`,
        borderRadius: `${radius}px`,
        fontFamily: fonts.serif,
        fontStyle: 'italic',
        fontSize: 'clamp(1.0625rem, 1rem + 0.35vw, 1.1875rem)',
        lineHeight: 1.55,
        color: 'text.primary',
        '& p': { margin: 0 },
        '& p + p': { marginTop: '0.6em' },
      }}
    >
      {nodesToJSX({ nodes: node.children })}
    </Box>
  ),

  upload: ({ node }) => {
    const media = node.value as Media | number | null | undefined

    if (!media || typeof media !== 'object' || !media.url) return null
    if (media.mimeType && !media.mimeType.startsWith('image')) {
      return (
        <Typography variant="body1" component="p" sx={{ my: 2.5 }}>
          <AppLink href={media.url}>{media.filename ?? 'Télécharger le fichier'}</AppLink>
        </Typography>
      )
    }

    // `alt` est obligatoire sur la collection Media : il est toujours renseigné.
    const alt = (node.fields as { alt?: string } | undefined)?.alt || media.alt

    // Pas de légende visible : le bloc upload de l'éditeur n'expose qu'un texte
    // alternatif, qui n'a pas vocation à être affiché comme une légende.
    return (
      <Box component="figure" sx={{ my: 4, mx: 0 }}>
        <Image
          src={media.url}
          alt={alt}
          width={media.width ?? 1200}
          height={media.height ?? 800}
          sizes="(max-width: 900px) 100vw, 720px"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </Box>
    )
  },

  blocks: {
    callout: ({ node }) => (
      <Callout variant={node.fields.variant}>
        <PayloadRichText data={node.fields.content} disableContainer />
      </Callout>
    ),
  },
})

type Props = {
  data: Parameters<typeof PayloadRichText>[0]['data']
  /** `false` pour laisser le contenu occuper toute la largeur disponible. */
  constrained?: boolean
}

/**
 * Corps d'article Lexical rendu en JSX côté serveur, via le convertisseur
 * officiel de `@payloadcms/richtext-lexical`.
 *
 * La colonne de lecture est bornée à ~70 caractères et l'interlignage vient des
 * variantes `body1` du thème.
 */
export function RichText({ data, constrained = true }: Props) {
  return (
    <Box
      sx={{
        maxWidth: constrained ? measure : 'none',
        '& > *:first-of-type': { marginTop: 0 },
        '& > *:last-child': { marginBottom: 0 },
        '& ul, & ol': { my: 2.5, pl: 3 },
        '& li': { mb: 1, lineHeight: 1.7 },
        '& li::marker': { color: colors.blueMid },
        '& a': { color: colors.blueBright },
        '& hr': { my: 5, border: 0, borderTop: `1px solid ${rule}` },
        '& strong': { fontWeight: 700 },
      }}
    >
      <PayloadRichText data={data} converters={converters} disableContainer />
    </Box>
  )
}

export default RichText
