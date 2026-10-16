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

const mediumDate = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
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

/** « 22 sept. 2026 » — format compact des métadonnées de vignette. */
export const formatMediumDate = (value: string | number | Date | null | undefined): string =>
  toDate(value) ? mediumDate.format(toDate(value) as Date) : ''

/** « 22/09/2026 » */
export const formatShortDate = (value: string | number | Date | null | undefined): string =>
  toDate(value) ? shortDate.format(toDate(value) as Date) : ''

/** Valeur de l'attribut `datetime` d'un élément `<time>` (ISO 8601). */
export const toDateTimeAttribute = (
  value: string | number | Date | null | undefined,
): string | undefined => toDate(value)?.toISOString()

const dayPartsFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Décalage de Paris par rapport à UTC (+1 en CET, +2 en CEST), en heures. */
const parisOffsetHours = (instant: Date): number => {
  const offset = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    timeZoneName: 'shortOffset',
  })
    .formatToParts(instant)
    .find((part) => part.type === 'timeZoneName')?.value

  return offset ? Number(offset.replace('GMT', '')) || 0 : 0
}

/**
 * Minuit à Paris (début du jour courant par défaut), exprimé comme instant
 * UTC. Sert à distinguer, côté requêtes, ce qui est à venir de ce qui est
 * passé (rubrique Salons CSE, § 8) sans dépendre du fuseau du serveur — qui
 * tourne le plus souvent en UTC, décalé de une à deux heures par rapport à
 * Paris selon la saison.
 *
 * Calcul en deux temps car le décalage n'est pas fixe : on lit d'abord la
 * date (année/mois/jour) telle que vue depuis Paris, puis on corrige l'instant
 * UTC obtenu par le décalage réellement appliqué ce jour-là.
 */
export const startOfTodayParis = (now: Date = new Date()): Date => {
  const parts = Object.fromEntries(
    dayPartsFormatter.formatToParts(now).map((part) => [part.type, part.value]),
  )

  const midnightUtcGuess = new Date(
    Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)),
  )

  return new Date(midnightUtcGuess.getTime() - parisOffsetHours(midnightUtcGuess) * 3_600_000)
}

const dayNumberFormatter = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', timeZone: TIME_ZONE })
const dayMonthFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
  timeZone: TIME_ZONE,
})
const monthYearFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: 'long',
  year: 'numeric',
  timeZone: TIME_ZONE,
})
const monthAbbrevFormatter = new Intl.DateTimeFormat(LOCALE, { month: 'short', timeZone: TIME_ZONE })
const yearFormatter = new Intl.DateTimeFormat(LOCALE, { year: 'numeric', timeZone: TIME_ZONE })

/**
 * « 24-25 mars 2027 », ou une date unique pour un salon d'une seule journée
 * (rubrique Salons CSE, § 8). Les deux dates tombant le même mois sont
 * compressées en une seule mention de mois, plus lisible qu'une répétition.
 */
export const formatDateRange = (
  start: string | number | Date | null | undefined,
  end: string | number | Date | null | undefined,
): string => {
  const startDate = toDate(start)
  const endDate = toDate(end)
  if (!startDate || !endDate) return ''
  if (startDate.getTime() === endDate.getTime()) return formatLongDate(endDate)

  return monthYearFormatter.format(startDate) === monthYearFormatter.format(endDate)
    ? `${dayNumberFormatter.format(startDate)}-${formatLongDate(endDate)}`
    : `${dayMonthFormatter.format(startDate)} – ${formatLongDate(endDate)}`
}

export type EventDateBadgeParts = { days: string; month: string; year: string }

/**
 * Jours, mois abrégé et année d'un salon, pour l'affichage compact en
 * vignette (« 24-25 » / « MARS » / « 2027 »).
 */
export const formatEventBadge = (
  start: string | number | Date | null | undefined,
  end: string | number | Date | null | undefined,
): EventDateBadgeParts | null => {
  const startDate = toDate(start)
  const endDate = toDate(end)
  if (!startDate || !endDate) return null

  const days =
    startDate.getTime() === endDate.getTime()
      ? dayNumberFormatter.format(startDate)
      : `${dayNumberFormatter.format(startDate)}-${dayNumberFormatter.format(endDate)}`

  return {
    days,
    month: monthAbbrevFormatter.format(endDate).replace('.', '').toUpperCase(),
    year: yearFormatter.format(endDate),
  }
}

/** « Mars 2027 », capitalisé — sert à regrouper les salons par mois de début. */
export const formatMonthLabel = (value: string | number | Date | null | undefined): string => {
  const date = toDate(value)
  if (!date) return ''

  const label = monthYearFormatter.format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export { toDate }
