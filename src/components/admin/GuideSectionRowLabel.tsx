'use client'

/**
 * Libellé des lignes du tableau « Sections » dans l'admin : le titre saisi
 * plutôt que « Section 01 », pour que l'équipe éditoriale s'y retrouve quand un
 * guide compte une dizaine de sections repliées.
 */

import { useRowLabel } from '@payloadcms/ui'

type SectionRow = {
  heading?: string | null
}

export const GuideSectionRowLabel = () => {
  const { data, rowNumber } = useRowLabel<SectionRow>()

  const heading = data?.heading?.trim()
  const position = String((rowNumber ?? 0) + 1).padStart(2, '0')

  return <span>{heading ? `${position}. ${heading}` : `Section ${position}`}</span>
}

export default GuideSectionRowLabel
