import Box from '@mui/material/Box'

import AppLink from '@/components/AppLink'
import PanelCard from '@/components/PanelCard'
import type { TocEntry } from '@/lib/toc'

type Props = {
  entries: TocEntry[]
}

/** Sommaire interne d'un contenu (§ 2.2), déduit des titres du corps de texte. */
export function ArticleToc({ entries }: Props) {
  if (entries.length === 0) return null

  return (
    <PanelCard title="Dans cet article" id="sommaire" component="h2">
      <Box component="ol" sx={{ listStyle: 'decimal', m: 0, pl: 2.5, display: 'grid', gap: 1 }}>
        {entries.map((entry) => (
          <Box
            component="li"
            key={entry.id}
            sx={{
              pl: entry.level === 3 ? 1.5 : 0,
              fontSize: '0.875rem',
              '&::marker': { color: 'text.secondary' },
            }}
          >
            <AppLink href={`#${entry.id}`} sx={{ color: 'text.secondary', fontSize: 'inherit' }}>
              {entry.label}
            </AppLink>
          </Box>
        ))}
      </Box>
    </PanelCard>
  )
}

export default ArticleToc
