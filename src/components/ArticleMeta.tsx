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
  const parts: React.ReactNode[] = []

  if (typeof readingTime === 'number' && readingTime > 0) {
    parts.push(
      <Box
        component="span"
        key="reading"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
      >
        <AccessTimeOutlinedIcon aria-hidden sx={iconStyles} />
        {readingTime} min de lecture
      </Box>,
    )
  }

  if (published) {
    parts.push(
      <Box
        component="time"
        key="published"
        dateTime={toDateTimeAttribute(published)}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
      >
        <CalendarTodayOutlinedIcon aria-hidden sx={iconStyles} />
        {compact ? formatMediumDate(published) : `Publié le ${formatLongDate(published)}`}
      </Box>,
    )
  }

  if (showUpdated) {
    parts.push(
      <Box
        component="time"
        key="updated"
        dateTime={toDateTimeAttribute(updated)}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
      >
        <UpdateOutlinedIcon aria-hidden sx={iconStyles} />
        {compact ? `MàJ ${formatMediumDate(updated)}` : `Mis à jour le ${formatLongDate(updated)}`}
      </Box>,
    )
  }

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
