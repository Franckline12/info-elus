/**
 * Normalisation et validation des adresses saisies dans le formulaire (§ 2.6).
 *
 * L'adresse est la clé unique de la collection : sans normalisation,
 * « Elu@CSE.fr » et « elu@cse.fr » créeraient deux abonnés, donc deux emails de
 * confirmation pour la même personne.
 */

/** Marge confortable : la limite pratique des adresses réelles tourne autour de 254. */
export const EMAIL_MAX_LENGTH = 254

/**
 * Format accepté : volontairement permissif sur la partie locale, strict sur la
 * présence d'un domaine pointé. Le seul juge définitif reste la délivrabilité
 * de l'email de confirmation — c'est tout l'intérêt du double opt-in.
 */
const EMAIL_PATTERN =
  /^[^\s@,;<>()[\]\\"]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i

/** Adresse débarrassée des espaces et ramenée en minuscules. */
export const normalizeEmail = (value: string): string => value.trim().toLowerCase()

export const isValidEmail = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length <= EMAIL_MAX_LENGTH &&
  EMAIL_PATTERN.test(normalizeEmail(value))
