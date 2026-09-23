import type { CollectionBeforeValidateHook } from 'payload'

import { formatSlug } from './formatSlug'

export type AnchoredSection = {
  heading?: string | null
  anchor?: string | null
}

/**
 * Ancres des sections d'un guide : dérivées du titre de section, et garanties
 * uniques **à l'échelle du document**.
 *
 * Deux sections « Les délais » produisent `les-delais` et `les-delais-2` : sans
 * cela, le lien du sommaire ramènerait toujours à la première, et deux `id`
 * identiques rendraient la page invalide.
 *
 * Le suffixe est attribué par un jeu d'essais successifs, et non par un simple
 * compteur : si une autre section s'appelle déjà « Les délais 2 », son ancre
 * naturelle est déjà prise et la suivante devient `les-delais-2-2`.
 *
 * Fonction pure, indépendante de Payload, pour rester testable.
 */
export const withUniqueAnchors = <T extends AnchoredSection>(sections: T[]): T[] => {
  const taken = new Set<string>()

  return sections.map((section, index) => {
    // Un titre vide est refusé par la validation du champ ; on produit quand
    // même une ancre stable pour ne pas casser le sommaire entre-temps.
    const base = formatSlug(section.heading ?? '') || `section-${index + 1}`

    let anchor = base
    let suffix = 2
    while (taken.has(anchor)) {
      anchor = `${base}-${suffix}`
      suffix += 1
    }
    taken.add(anchor)

    return section.anchor === anchor ? section : { ...section, anchor }
  })
}

/**
 * Hook `beforeValidate` **de document** : l'unicité se joue entre les lignes du
 * tableau, ce qu'un hook de champ — qui ne voit que sa propre ligne — ne peut
 * pas garantir.
 */
export const uniqueSectionAnchors: CollectionBeforeValidateHook = ({ data }) => {
  if (!data || !Array.isArray(data.sections)) return data

  return {
    ...data,
    sections: withUniqueAnchors(data.sections as AnchoredSection[]),
  }
}
