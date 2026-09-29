'use client'

/**
 * Libellé des lignes des tableaux `array` dans l'admin : le texte saisi plutôt
 * que « Question 01 », pour que l'équipe éditoriale s'y retrouve quand une
 * dizaine de lignes sont repliées.
 *
 * Générique : le premier champ non vide parmi `fields` sert de libellé, ce qui
 * couvre aussi bien les sections d'un guide (`heading`) que les questions d'un
 * quiz (`prompt`).
 */

import { useRowLabel } from '@payloadcms/ui'

const DEFAULT_FIELDS = ['heading', 'prompt', 'title', 'label', 'name', 'text']

type Props = {
  /** Champs candidats, dans l'ordre de préférence. */
  fields?: string[]
  /** Mot employé quand la ligne est encore vide : « Question 01 ». */
  fallback?: string
  /** Au-delà, le libellé est tronqué : les énoncés peuvent être longs. */
  maxLength?: number
}

export const ArrayRowLabel = ({ fields, fallback = 'Élément', maxLength = 80 }: Props) => {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>()

  const position = String((rowNumber ?? 0) + 1).padStart(2, '0')

  const source = (fields ?? DEFAULT_FIELDS)
    .map((name) => data?.[name])
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0)

  const label = source?.trim().replace(/\s+/g, ' ')

  if (!label) return <span>{`${fallback} ${position}`}</span>

  return (
    <span>{`${position}. ${label.length > maxLength ? `${label.slice(0, maxLength)}…` : label}`}</span>
  )
}

export default ArrayRowLabel
