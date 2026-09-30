/**
 * Zones d'intervention des prestataires (§ 2.4) : les dix-huit régions
 * françaises, précédées d'une option « France entière ».
 *
 * Liste fixe déclarée en dur plutôt qu'en collection de taxonomie : le
 * découpage régional ne bouge pas au rythme éditorial, et une liste figée
 * évite à l'équipe d'avoir à créer puis maintenir dix-huit documents. Comme
 * pour les catégories, le module reste neutre : la collection Payload et les
 * pages publiques lisent la même source.
 */
export const interventionAreaOptions = [
  { value: 'france', label: 'France entière' },
  { value: 'auvergne-rhone-alpes', label: 'Auvergne-Rhône-Alpes' },
  { value: 'bourgogne-franche-comte', label: 'Bourgogne-Franche-Comté' },
  { value: 'bretagne', label: 'Bretagne' },
  { value: 'centre-val-de-loire', label: 'Centre-Val de Loire' },
  { value: 'corse', label: 'Corse' },
  { value: 'grand-est', label: 'Grand Est' },
  { value: 'hauts-de-france', label: 'Hauts-de-France' },
  { value: 'ile-de-france', label: 'Île-de-France' },
  { value: 'normandie', label: 'Normandie' },
  { value: 'nouvelle-aquitaine', label: 'Nouvelle-Aquitaine' },
  { value: 'occitanie', label: 'Occitanie' },
  { value: 'pays-de-la-loire', label: 'Pays de la Loire' },
  { value: 'provence-alpes-cote-d-azur', label: 'Provence-Alpes-Côte d’Azur' },
  { value: 'guadeloupe', label: 'Guadeloupe' },
  { value: 'guyane', label: 'Guyane' },
  { value: 'martinique', label: 'Martinique' },
  { value: 'la-reunion', label: 'La Réunion' },
  { value: 'mayotte', label: 'Mayotte' },
] as const

export type InterventionAreaValue = (typeof interventionAreaOptions)[number]['value']

/** Valeur de l'option « France entière », traitée à part dans les filtres. */
export const NATIONWIDE_AREA: InterventionAreaValue = 'france'

export const interventionAreaLabel = (value: string): string =>
  interventionAreaOptions.find((option) => option.value === value)?.label ?? value

/** Une zone connue, ou `undefined` si l'URL en propose une autre. */
export const interventionAreaValue = (value?: string | null): string | undefined =>
  interventionAreaOptions.some((option) => option.value === value) ? (value as string) : undefined

/**
 * Zones à interroger quand un visiteur filtre sur une région : un prestataire
 * déclaré « France entière » intervient aussi dans cette région, il doit donc
 * remonter dans les résultats.
 */
export const matchingAreas = (area: string): string[] =>
  area === NATIONWIDE_AREA ? [NATIONWIDE_AREA] : [area, NATIONWIDE_AREA]
