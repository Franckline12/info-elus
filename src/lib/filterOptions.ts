/**
 * Options des listes déroulantes de `SearchBar`, et leurs compteurs.
 *
 * Un compteur est calculé à recherche constante mais sans le filtre lui-même :
 * chaque option annonce donc ce qu'elle donnerait si on la choisissait, au lieu
 * d'afficher zéro partout dès qu'un filtre est actif.
 */

export type FacetCounts = {
  /** Résultats sans aucun filtre de cette famille. */
  total: number
  /** Résultats par valeur d'option (slug de taxonomie, valeur de select…). */
  byValue: Record<string, number>
}

export type FilterOption = { value: string; label: string; count?: number }

/**
 * Convertit une taxonomie (catégories, thèmes) en options. Les documents sans
 * slug sont écartés : ils ne sont pas filtrables par URL.
 */
export const taxonomyOptions = (
  items: { name: string; slug?: string | null }[],
  counts?: FacetCounts,
): FilterOption[] =>
  items.flatMap((item) =>
    item.slug
      ? [{ value: item.slug, label: item.name, count: counts?.byValue[item.slug] }]
      : [],
  )

/** Même conversion pour une liste de valeurs fixes (zones d’intervention). */
export const valueOptions = (
  items: readonly { value: string; label: string }[],
  counts?: FacetCounts,
): FilterOption[] =>
  items.map((item) => ({ value: item.value, label: item.label, count: counts?.byValue[item.value] }))
