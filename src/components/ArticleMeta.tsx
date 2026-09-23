import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { formatLongDate, toDate, toDateTimeAttribute } from '@/lib/formatDate'

type Props = {
  publishedAt?: string | null
  updatedAt?: string | null
  readingTime?: number | null
  /** Au-delà de cet écart, la date de mise à jour est jugée significative. */
  updateThresholdHours?: number
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
}: Props) {
  const published = toDate(publishedAt)
  const updated = toDate(updatedAt)

  const showUpdated =
    published !== null &&
    updated !== null &&
    updated.getTime() - published.getTime() > updateThresholdHours * 3600 * 1000

  const parts: React.ReactNode[] = []

  if (published) {
    parts.push(
      <Box component="time" key="published" dateTime={toDateTimeAttribute(published)}>
        Publié le {formatLongDate(published)}
      </Box>,
    )
  }

  if (showUpdated) {
    parts.push(
      <Box component="time" key="updated" dateTime={toDateTimeAttribute(updated)}>
        Mis à jour le {formatLongDate(updated)}
      </Box>,
    )
  }

  if (typeof readingTime === 'number' && readingTime > 0) {
    parts.push(<span key="reading">{readingTime} min de lecture</span>)
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
        gap: 1,
        color: 'text.secondary',
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
            gap: 1,
            '&:not(:last-of-type)::after': { content: '"·"', opacity: 0.6 },
          }}
        >
          {part}
        </Box>
      ))}
    </Typography>
  )
}

export default ArticleMeta
