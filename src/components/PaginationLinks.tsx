'use client'

/**
 * `Pagination` de MUI rendu sous forme de liens : chaque page a sa propre URL,
 * donc un état partageable et indexable.
 *
 * Composant client uniquement parce que `renderItem` est une fonction — un
 * composant serveur ne peut pas la transmettre. Aucun état, aucun effet : les
 * URL sont recalculées à partir de props sérialisables.
 */

import Box from '@mui/material/Box'
import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import NextLink from 'next/link'

import type { ContentType } from '@/lib/routes'
import { listingPagePath } from '@/lib/routes'

type Props = {
  type: ContentType
  page: number
  totalPages: number
  categorySlug?: string
}

export function PaginationLinks({ type, page, totalPages, categorySlug }: Props) {
  if (totalPages <= 1) return null

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
      <Pagination
        page={page}
        count={totalPages}
        shape="rounded"
        color="primary"
        getItemAriaLabel={(itemType, itemPage) => {
          if (itemType === 'previous') return 'Page précédente'
          if (itemType === 'next') return 'Page suivante'
          if (itemType === 'first') return 'Première page'
          if (itemType === 'last') return 'Dernière page'
          return `Page ${itemPage}`
        }}
        renderItem={(item) => (
          <PaginationItem
            component={NextLink}
            href={listingPagePath(type, { page: item.page ?? 1, categorySlug })}
            {...item}
          />
        )}
      />
    </Box>
  )
}

export default PaginationLinks
