import { describe, expect, it } from 'vitest'

import { formatSlug } from '@/hooks/formatSlug'

describe('formatSlug', () => {
  const cases: Array<[string, string]> = [
    // exemple de référence du cahier des charges
    ['Santé & sécurité au travail', 'sante-securite-au-travail'],
    // accents et cédille
    ['Élections CSE : négociation à Nîmes', 'elections-cse-negociation-a-nimes'],
    ['Budget & fonctionnement du CSE', 'budget-fonctionnement-du-cse'],
    // majuscules
    ['GUIDES CSE', 'guides-cse'],
    // apostrophes droite et typographique
    ["Droit d'alerte de l'élu", 'droit-d-alerte-de-l-elu'],
    ['L’ordre du jour', 'l-ordre-du-jour'],
    // ligature œ
    ['Cœur de métier & œuvres sociales', 'coeur-de-metier-oeuvres-sociales'],
    // espaces multiples et tabulations
    ['Réunion   plénière\tannuelle', 'reunion-pleniere-annuelle'],
    // tirets en bord et tirets multiples
    ['--Mandat -- du secrétaire--', 'mandat-du-secretaire'],
    // ponctuation et caractères spéciaux
    ['Quiz #3 : combien d’heures ? (100 %)', 'quiz-3-combien-d-heures-100'],
    // chaîne déjà propre : idempotence
    ['sante-securite-au-travail', 'sante-securite-au-travail'],
    // chiffres et unités conservés
    ['Seuil de 50 salariés', 'seuil-de-50-salaries'],
    // cas limites
    ['', ''],
    ['   ', ''],
    ['&&&', ''],
  ]

  it.each(cases)('normalise %j en %j', (input, expected) => {
    expect(formatSlug(input)).toBe(expected)
  })

  it('est idempotent', () => {
    for (const [input] of cases) {
      const once = formatSlug(input)
      expect(formatSlug(once)).toBe(once)
    }
  })
})
