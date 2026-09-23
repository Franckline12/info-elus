import type { Theme } from '@/payload-types'

import { colors } from '@/theme/tokens'

/** Couleur de bordure d'un guide, portée par son thème (§ 5.3). */
export const themeColor = (value: Theme['color'] | null | undefined): string => {
  switch (value) {
    case 'blue-deep':
      return colors.blueDeep
    case 'blue-bright':
      return colors.blueBright
    case 'blue-mid':
    default:
      return colors.blueMid
  }
}

export const asTheme = (value: Theme | number | null | undefined): Theme | null =>
  value && typeof value === 'object' ? value : null
