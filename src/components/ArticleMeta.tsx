import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined'

import { formatLongDate, formatMediumDate, toDate, toDateTimeAttribute } from '@/lib/formatDate'

type Props = {
  publishedAt?: string | null
  updatedAt?: string | null
  readingTime?: number | null
  /** Au-delà de cet écart, la date de mise à jour est jugée significative. */
  updateThresholdHours?: number
  /**
   * `compact` : icônes et date abrégée, pour les vignettes et les bandeaux.
   * `default` : phrases complètes, pour l'en-tête d'un contenu.
   */
  variant?: 'default' | 'compact'
  /**
   * Place la date de publication en tête et l'accentue. Une actualité se situe
   * d'abord dans le temps : sa date compte davantage que sur un article de fond
   * (§ 2.3).
   */
  emphasizeDate?: boolean
  /** Hérite de la couleur ambiante : utile sur les fonds bleu profond. */
  inherit?: boolean
}

/**
 * Métadonnées de lecture (§ 2.1). La date de mise à jour n'est affichée que si
 * elle s'écarte réellement de la publication : un autosave ne doit pas faire
 * apparaître « Mis à jour le… » sur un article inchangé.
 */
export function ArticleMeta({
  publishedAt,
  updatedAt,
  readingTime,
  updateThresholdHours = 24,
  variant = 'default',
  emphasizeDate = false,
  inherit = false,
}: Props) {
  const published = toDate(publishedAt)
  const updated = toDate(updatedAt)
  const compact = variant === 'compact'

  const showUpdated =
    published !== null &&
    updated !== null &&
    updated.getTime() - published.getTime() > updateThresholdHours * 3600 * 1000

  const iconStyles = { fontSize: '0.95em', opacity: 0.8 }
  const itemStyles = { display: 'inline-flex', alignItems: 'center', gap: 0.5 }

  const readingPart =
    typeof readingTime === 'number' && readingTime > 0 ? (
      <Box component="span" sx={itemStyles}>
        <AccessTimeOutlinedIcon aria-hidden sx={iconStyles} />
        {readingTime} min de lecture
      </Box>
    ) : null

  const publishedPart = published ? (
    <Box
      component="time"
      dateTime={toDateTimeAttribute(published)}
      sx={{
        ...itemStyles,
        ...(emphasizeDate ? { fontWeight: 600, color: inherit ? 'inherit' : 'text.primary' } : {}),
      }}
    >
      <CalendarTodayOutlinedIcon aria-hidden sx={iconStyles} />
      {compact ? formatMediumDate(published) : `Publié le ${formatLongDate(published)}`}
    </Box>
  ) : null

  const updatedPart = showUpdated ? (
    <Box component="time" dateTime={toDateTimeAttribute(updated)} sx={itemStyles}>
      <UpdateOutlinedIcon aria-hidden sx={iconStyles} />
      {compact ? `MàJ ${formatMediumDate(updated)}` : `Mis à jour le ${formatLongDate(updated)}`}
    </Box>
  ) : null

  // Le temps de lecture ouvre la ligne, sauf quand la date prime : sur une
  // actualité, c'est elle qu'on lit en premier.
  const parts = (
    emphasizeDate
      ? [publishedPart, readingPart, updatedPart]
      : [readingPart, publishedPart, updatedPart]
  ).filter((part): part is React.ReactElement => part !== null)

  if (parts.length === 0) return null

  return (
    <Typography
      variant="body2"
      component="p"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: compact ? 1.5 : 1,
        fontSize: compact ? '0.8125rem' : undefined,
        color: inherit ? 'inherit' : 'text.secondary',
        m: 0,
      }}
    >
      {parts.map((part, index) => (
        <Box
          component="span"
          key={index}
          // Le séparateur est accroché à la fin de chaque élément plutôt qu'au
          // début du suivant : au retour à la ligne il reste sur la ligne
          // précédente, au lieu de l'ouvrir.
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: compact ? 1.5 : 1,
            ...(compact ? {} : { '&:not(:last-of-type)::after': { content: '"·"', opacity: 0.6 } }),
          }}
        >
          {part}
        </Box>
      ))}
    </Typography>
  )
}

export default ArticleMeta
