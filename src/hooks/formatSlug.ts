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

/**
 * Variante pour les salons (Events) : un même salon revient chaque année sous
 * le même titre (« Solutions CSE Paris » en 2026, puis en 2027…), mais le
 * slug doit rester unique d'une édition à l'autre. La dérivation automatique
 * ajoute donc l'année de la date de début — « Date de fin » n'est pas
 * utilisée ici, un même salon ne commence jamais deux années différentes.
 */
export const formatEventSlugHook: FieldHook = ({ data, originalDoc, siblingData, value }) => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return formatSlug(value)
  }

  const title = siblingData?.title ?? data?.title ?? originalDoc?.title
  if (typeof title !== 'string' || title.trim().length === 0) {
    return value
  }

  const startDate = siblingData?.startDate ?? data?.startDate ?? originalDoc?.startDate
  const year = startDate ? new Date(startDate).getFullYear() : undefined

  return Number.isFinite(year) ? formatSlug(`${title}-${year}`) : formatSlug(title)
}
