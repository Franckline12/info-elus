import Breadcrumbs from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography'

import { absoluteUrl } from '@/lib/site'

import AppLink from './AppLink'
import JsonLd from './JsonLd'

export type BreadcrumbItem = {
  label: string
  /** Absent sur le dernier élément : la page courante n'est pas un lien. */
  href?: string
}

type Props = {
  items: BreadcrumbItem[]
}

/**
 * Fil d'Ariane (§ 2.7), doublé d'un balisage JSON-LD `BreadcrumbList` pour que
 * les moteurs affichent la même hiérarchie dans leurs résultats.
 */
export function Breadcrumb({ items }: Props) {
  if (items.length === 0) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  }

  return (
    <>
      <Breadcrumbs
        aria-label="Fil d’Ariane"
        separator="/"
        sx={{
          fontSize: '0.8125rem',
          color: 'text.secondary',
          '& ol': { rowGap: 0.5 },
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          if (isLast || !item.href) {
            return (
              <Typography
                key={`${item.label}-${index}`}
                component="span"
                sx={{ fontSize: 'inherit', color: 'text.primary' }}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </Typography>
            )
          }

          return (
            <AppLink
              key={`${item.label}-${index}`}
              href={item.href}
              sx={{ fontSize: 'inherit', color: 'text.secondary' }}
            >
              {item.label}
            </AppLink>
          )
        })}
      </Breadcrumbs>
      <JsonLd data={jsonLd} />
    </>
  )
}

export default Breadcrumb
