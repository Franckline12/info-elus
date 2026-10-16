import { describe, expect, it } from 'vitest'

import { formatEventSlugHook, formatSlug } from '@/hooks/formatSlug'

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

/** Le hook reçoit tout le contexte Payload ; seuls `siblingData` et `value` nous intéressent ici. */
const runEventSlugHook = (siblingData: Record<string, unknown>, value = '') =>
  formatEventSlugHook({ siblingData, value } as Parameters<typeof formatEventSlugHook>[0])

describe('formatEventSlugHook', () => {
  it('dérive le slug du titre et de l’année de la date de début : un même salon reste distinct d’une édition à l’autre', () => {
    expect(
      runEventSlugHook({ title: 'Solutions CSE Paris', startDate: '2027-03-24' }),
    ).toBe('solutions-cse-paris-2027')

    expect(
      runEventSlugHook({ title: 'Solutions CSE Paris', startDate: '2028-03-22' }),
    ).toBe('solutions-cse-paris-2028')
  })

  it('normalise une valeur saisie à la main sans la recalculer depuis le titre', () => {
    expect(
      runEventSlugHook({ title: 'Solutions CSE Paris', startDate: '2027-03-24' }, 'Mon Slug Perso'),
    ).toBe('mon-slug-perso')
  })

  it('retombe sur le titre seul si la date de début n’est pas encore saisie', () => {
    expect(runEventSlugHook({ title: 'Solutions CSE Paris' })).toBe('solutions-cse-paris')
  })

  it('laisse la valeur telle quelle si le titre est absent', () => {
    expect(runEventSlugHook({}, '')).toBe('')
  })
})
