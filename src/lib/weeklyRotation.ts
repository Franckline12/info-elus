/**
 * Numéro de semaine ISO 8601 (1 à 53), calculé en UTC pour que le rendu ne
 * dépende pas du fuseau du serveur.
 *
 * Le jeudi de la semaine courante détermine l'année ISO : c'est lui qui décide
 * à quelle année appartiennent les journées de part et d'autre du 1er janvier.
 * Le 4 janvier de cette année-là tombe toujours dans la semaine 1, il sert donc
 * d'origine.
 */
export const isoWeekNumber = (date: Date): number => {
  const thursday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  thursday.setUTCDate(thursday.getUTCDate() + 3 - ((thursday.getUTCDay() + 6) % 7))
  const inFirstWeek = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4))

  return 1 + Math.round((thursday.getTime() - inFirstWeek.getTime()) / (7 * 86400000))
}

/**
 * Élément d'une file qui tourne d'une semaine sur l'autre : stable du lundi au
 * dimanche, avance d'un cran au changement de semaine ISO, repart au début une
 * fois la file épuisée. `null` si la file est vide.
 */
export const pickWeekly = <T>(items: readonly T[], date: Date): T | null => {
  if (items.length === 0) return null

  return items[isoWeekNumber(date) % items.length] ?? null
}
