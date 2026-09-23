import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'

import AppLink from '@/components/AppLink'
import PanelCard from '@/components/PanelCard'
import type { Guide, Media } from '@/payload-types'
import { colors } from '@/theme/tokens'

type Props = {
  resources: NonNullable<Guide['resources']>
}

const asMedia = (value: Media | number | null | undefined): Media | null =>
  value && typeof value === 'object' ? value : null

/** « 250 Ko », « 1,2 Mo » — taille lisible d'un fichier à télécharger. */
const formatSize = (bytes?: number | null): string | null => {
  if (!bytes || bytes <= 0) return null
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`
}

/** Extension en capitales, telle qu'affichée sur la maquette (« PDF – 250 Ko »). */
const formatKind = (file: Media): string => {
  const extension = file.filename?.split('.').pop()
  if (extension) return extension.toUpperCase()
  return file.mimeType?.split('/').pop()?.toUpperCase() ?? 'Fichier'
}

/** Ressources téléchargeables d'un guide (§ 2.2). */
export function GuideResources({ resources }: Props) {
  const files = resources
    .map((resource) => ({ label: resource.label, file: asMedia(resource.file) }))
    .filter((resource): resource is { label: string; file: Media } => resource.file !== null)

  if (files.length === 0) return null

  return (
    <PanelCard title="Télécharger" id="ressources">
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.5 }}>
        {files.map(({ label, file }) => {
          const size = formatSize(file.filesize)

          return (
            <Box component="li" key={file.id} sx={{ display: 'flex', gap: 1.5 }}>
              <DescriptionOutlinedIcon
                aria-hidden
                sx={{ fontSize: '1.25rem', color: colors.blueMid, flexShrink: 0, mt: 0.25 }}
              />
              <Box sx={{ minWidth: 0 }}>
                <AppLink
                  href={file.url ?? '#'}
                  download
                  sx={{ fontSize: '0.875rem', fontWeight: 500 }}
                >
                  {label}
                </AppLink>
                <Typography
                  component="p"
                  sx={{ fontSize: '0.75rem', color: 'text.secondary', m: 0 }}
                >
                  {formatKind(file)}
                  {size ? ` – ${size}` : ''}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>
    </PanelCard>
  )
}

export default GuideResources
