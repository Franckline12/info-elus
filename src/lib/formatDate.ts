/**
 * Formatage des dates en français. Le fuseau est figé sur `Europe/Paris` : sans
 * cela le rendu serveur (souvent en UTC) et le rendu navigateur peuvent produire
 * deux chaînes différentes, ce qui provoque une erreur d'hydratation React.
 */

const LOCALE = 'fr-FR'
const TIME_ZONE = 'Europe/Paris'

const longDate = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: TIME_ZONE,
})

const shortDate = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: TIME_ZONE,
})

const toDate = (value: string | number | Date | null | undefined): Date | null => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** « 22 septembre 2026 » */
export const formatLongDate = (value: string | number | Date | null | undefined): string =>
  toDate(value) ? longDate.format(toDate(value) as Date) : ''

/** « 22/09/2026 » */
export const formatShortDate = (value: string | number | Date | null | undefined): string =>
  toDate(value) ? shortDate.format(toDate(value) as Date) : ''

/** Valeur de l'attribut `datetime` d'un élément `<time>` (ISO 8601). */
export const toDateTimeAttribute = (
  value: string | number | Date | null | undefined,
): string | undefined => toDate(value)?.toISOString()

export { toDate }
