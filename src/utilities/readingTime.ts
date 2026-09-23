/** Vitesse de lecture retenue pour un contenu éditorial en français. */
const WORDS_PER_MINUTE = 200

/** Compte les mots d'une chaîne, en ignorant les espaces multiples. */
const countWordsInText = (text: string): number => {
  const trimmed = text.trim()

  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length
}

/**
 * Parcourt récursivement un arbre JSON Lexical et additionne les mots portés
 * par les nœuds texte.
 *
 * La récursion est volontairement générique : elle descend dans `children`
 * comme dans les `fields` des blocks (un encadré Callout et son contenu
 * richText imbriqué sont donc comptés), sans connaître leur structure.
 * Seules les valeurs stockées sous la clé `text` sont comptées, ce qui exclut
 * les métadonnées (slug de block, valeur d'un select, URL d'un lien…).
 */
const countWords = (node: unknown): number => {
  if (Array.isArray(node)) {
    return node.reduce<number>((total, child) => total + countWords(child), 0)
  }

  if (node === null || typeof node !== 'object') {
    return 0
  }

  return Object.entries(node as Record<string, unknown>).reduce<number>((total, [key, value]) => {
    if (key === 'text') {
      return total + (typeof value === 'string' ? countWordsInText(value) : 0)
    }

    return total + countWords(value)
  }, 0)
}

/**
 * Temps de lecture en minutes d'un contenu Lexical : arrondi au supérieur,
 * avec un minimum de 1 minute pour ne jamais afficher « 0 min ».
 */
export const calculateReadingTime = (content: unknown): number =>
  Math.max(1, Math.ceil(countWords(content) / WORDS_PER_MINUTE))
