import { describe, expect, it } from 'vitest'

import { isoWeekNumber, pickWeekly } from '@/lib/weeklyRotation'

/** Date UTC à midi : l'heure ne doit jamais changer le résultat. */
const day = (iso: string) => new Date(`${iso}T12:00:00.000Z`)

describe('isoWeekNumber', () => {
  it('numérote les semaines d’une année ordinaire', () => {
    expect(isoWeekNumber(day('2026-01-01'))).toBe(1)
    expect(isoWeekNumber(day('2026-01-05'))).toBe(2)
    expect(isoWeekNumber(day('2026-10-08'))).toBe(41)
  })

  it('rattache les jours de fin d’année à l’année ISO du jeudi', () => {
    // 2026 compte 53 semaines : elle se termine le dimanche 3 janvier 2027.
    expect(isoWeekNumber(day('2026-12-31'))).toBe(53)
    expect(isoWeekNumber(day('2027-01-03'))).toBe(53)
    // Le 1er janvier 2021 est un vendredi : il appartient encore à 2020.
    expect(isoWeekNumber(day('2021-01-01'))).toBe(53)
    // À l'inverse, le 30 décembre 2024 est un lundi : il ouvre 2025.
    expect(isoWeekNumber(day('2024-12-30'))).toBe(1)
  })

  it('donne le même numéro du lundi au dimanche', () => {
    const week = [
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
    ]

    expect(new Set(week.map((date) => isoWeekNumber(day(date))))).toEqual(new Set([41]))
  })

  it('ne dépend pas de l’heure de la journée', () => {
    expect(isoWeekNumber(new Date('2026-10-11T23:59:59.999Z'))).toBe(41)
    expect(isoWeekNumber(new Date('2026-10-12T00:00:00.000Z'))).toBe(42)
  })
})

describe('pickWeekly', () => {
  const items = ['a', 'b', 'c']

  it('renvoie null quand la file est vide', () => {
    expect(pickWeekly([], day('2026-10-08'))).toBeNull()
  })

  it('renvoie toujours le même élément quand la file en compte un seul', () => {
    expect(pickWeekly(['seul'], day('2026-10-08'))).toBe('seul')
    expect(pickWeekly(['seul'], day('2026-10-15'))).toBe('seul')
  })

  it('ne change pas d’élément au cours d’une même semaine', () => {
    const monday = pickWeekly(items, day('2026-10-05'))

    expect(pickWeekly(items, day('2026-10-08'))).toBe(monday)
    expect(pickWeekly(items, day('2026-10-11'))).toBe(monday)
  })

  it('avance d’un cran par semaine et boucle sur la file', () => {
    // Semaines 41 à 44 : 41 % 3 = 2, puis 0, 1, 2.
    const weeks = ['2026-10-08', '2026-10-15', '2026-10-22', '2026-10-29']

    expect(weeks.map((date) => pickWeekly(items, day(date)))).toEqual(['c', 'a', 'b', 'c'])
  })

  it('parcourt toute la file sur une série de semaines consécutives', () => {
    const picks = Array.from({ length: items.length }, (_, offset) =>
      pickWeekly(items, new Date(day('2026-10-08').getTime() + offset * 7 * 86400000)),
    )

    expect(new Set(picks)).toEqual(new Set(items))
  })
})
