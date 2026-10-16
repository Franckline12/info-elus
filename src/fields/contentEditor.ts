import {
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { Callout } from '../blocks/Callout'

type ContentEditorArgs = {
  /** Collections proposées à l'éditeur pour les liens internes. */
  linkTo?: ('articles' | 'guides')[]
}

/**
 * Éditeur Lexical des corps de texte éditoriaux : un seul jeu de
 * fonctionnalités, partagé par le corps des articles et par les sections des
 * guides (§ 2.1 et § 2.2).
 *
 * Volontairement restreint à ce que demande le cahier des charges ; le H1 reste
 * réservé au titre de la page, les h2/h3 alimentent les sommaires.
 */
export const contentEditor = ({ linkTo = ['articles'] }: ContentEditorArgs = {}) =>
  lexicalEditor({
    features: () => [
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      BoldFeature(),
      ItalicFeature(),
      UnorderedListFeature(),
      OrderedListFeature(),
      BlockquoteFeature(),
      LinkFeature({ enabledCollections: linkTo }),
      // `alt` est requis sur la collection media : toute image insérée en a un.
      UploadFeature({ enabledCollections: ['media'] }),
      BlocksFeature({ blocks: [Callout] }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
    ],
  })

/**
 * Éditeur allégé des présentations de prestataires (§ 2.4) : sous-titres,
 * listes, gras, liens et citation.
 *
 * Volontairement plus pauvre que `contentEditor` : une fiche d'annuaire n'est
 * pas un espace éditorial, donc ni image ni encadré. Le H3 y est le plus haut
 * niveau, la fiche portant déjà un H1 (le nom) et un H2 (« Présentation »).
 */
export const profileEditor = ({ linkTo = ['articles', 'guides'] }: ContentEditorArgs = {}) =>
  lexicalEditor({
    features: () => [
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h3'] }),
      BoldFeature(),
      UnorderedListFeature(),
      OrderedListFeature(),
      BlockquoteFeature(),
      LinkFeature({ enabledCollections: linkTo }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
    ],
  })

/**
 * Éditeur de la description des salons (rubrique Salons CSE, § 8) : sous-titres,
 * listes, gras, liens et encadré.
 *
 * Ni italique ni citation — une fiche salon reste factuelle — et surtout pas
 * d'image : le visuel de la fiche est `featuredImage`, un second emplacement
 * ferait double emploi.
 */
export const eventEditor = ({ linkTo = ['articles', 'guides'] }: ContentEditorArgs = {}) =>
  lexicalEditor({
    features: () => [
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h3'] }),
      BoldFeature(),
      UnorderedListFeature(),
      OrderedListFeature(),
      LinkFeature({ enabledCollections: linkTo }),
      BlocksFeature({ blocks: [Callout] }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
    ],
  })
