import type { TextFieldSingleValidation } from 'payload'

/**
 * Adresse d'un site tiers : on exige une URL absolue en http(s), sans quoi le
 * lien partirait vers une page interne du site.
 *
 * Partagé par les prestataires, les organisateurs de salons et les salons
 * eux-mêmes (lien d'inscription) : même exigence, un seul endroit à corriger.
 */
export const validateUrl: TextFieldSingleValidation = (value) => {
  if (!value) return true

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return 'Adresse invalide : saisissez l’URL complète, par exemple https://exemple.fr'
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
    ? true
    : 'L’adresse doit commencer par http:// ou https://'
}
