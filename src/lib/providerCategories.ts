/**
 * Catégories de l'annuaire, fixées par le cahier des charges (§ 2.4).
 * Déclarées dans un module neutre : la collection Payload et les pages du front
 * s'appuient sur la même liste, sans que le front importe la configuration CMS.
 */
export const providerCategoryOptions = [
  { value: 'training', label: 'Formation' },
  { value: 'legal', label: 'Assistance juridique' },
  { value: 'accounting', label: 'Comptabilité & audit' },
  { value: 'ticketing', label: 'Billetterie & ASC' },
  { value: 'events', label: 'Événementiel' },
] as const

export type ProviderCategoryValue = (typeof providerCategoryOptions)[number]['value']

/** Libellé français d'une catégorie de prestataire. */
export const providerCategoryLabel = (value: string): string =>
  providerCategoryOptions.find((option) => option.value === value)?.label ?? value

/** Une valeur de catégorie connue, ou `undefined` si l'URL en propose une autre. */
export const providerCategoryValue = (value?: string | null): string | undefined =>
  providerCategoryOptions.some((option) => option.value === value) ? (value as string) : undefined
