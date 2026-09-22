import type { FieldHook } from 'payload'

/**
 * Caractères qui ne se décomposent pas en NFD et doivent être transposés
 * explicitement (œ → oe, æ → ae…).
 */
const LIGATURES: Record<string, string> = {
  œ: 'oe',
  æ: 'ae',
  ø: 'o',
  ß: 'ss',
  đ: 'd',
  ł: 'l',
}

/**
 * Normalise une chaîne en slug URL : minuscules, sans accent, mots séparés
 * par des tirets simples.
 *
 * « Santé & sécurité au travail » → sante-securite-au-travail
 */
export const formatSlug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[œæøßđł]/g, (char) => LIGATURES[char] ?? char)
    .normalize('NFD') // é → e + diacritique combinant
    .replace(/[\u0300-\u036f]/g, '') // retire les diacritiques
    .replace(/['’‘`´]/g, '-') // apostrophes → tirets
    .replace(/\s+/g, '-') // espaces → tirets
    .replace(/[^a-z0-9-]/g, '') // supprime tout le reste (&, ponctuation…)
    .replace(/-+/g, '-') // fusionne les tirets successifs
    .replace(/^-+|-+$/g, '') // pas de tiret en début ni en fin

/**
 * Construit un hook `beforeValidate` de champ qui remplit le slug depuis
 * `sourceField` quand il est vide, et normalise la valeur saisie à la main
 * dans le cas contraire.
 */
export const formatSlugHook =
  (sourceField: string): FieldHook =>
  ({ data, originalDoc, siblingData, value }) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      return formatSlug(value)
    }

    const source = siblingData?.[sourceField] ?? data?.[sourceField] ?? originalDoc?.[sourceField]

    if (typeof source === 'string' && source.trim().length > 0) {
      return formatSlug(source)
    }

    return value
  }
