import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import { rule } from '@/theme/tokens'

type Props = {
  url: string
  title: string
}

/**
 * Partage social (§ 2.7) : de simples liens `href`, aucun SDK tiers, aucun
 * cookie déposé — cohérent avec les exigences RGPD du § 4.4.
 */
export function ShareLinks({ url, title }: Props) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const targets = [
    {
      label: 'LinkedIn',
      ariaLabel: 'Partager sur LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: 'Facebook',
      ariaLabel: 'Partager sur Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: 'X',
      ariaLabel: 'Partager sur X',
      href: `https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: 'E-mail',
      ariaLabel: 'Partager par e-mail',
      href: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%20${encodedUrl}`,
      sameTab: true,
    },
  ]

  return (
    <Box
      component="section"
      aria-labelledby="partage-heading"
      sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}
    >
      <Typography
        id="partage-heading"
        component="h2"
        variant="overline"
        sx={{ color: 'text.secondary' }}
      >
        Partager
      </Typography>

      <Box
        component="ul"
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, listStyle: 'none', m: 0, p: 0 }}
      >
        {targets.map((target) => (
          <li key={target.label}>
            <Link
              href={target.href}
              underline="none"
              aria-label={target.ariaLabel}
              {...(target.sameTab ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              sx={{
                display: 'inline-block',
                px: 1.5,
                py: 0.5,
                border: `1px solid ${rule}`,
                fontSize: '0.875rem',
                color: 'text.secondary',
                '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
              }}
            >
              {target.label}
            </Link>
          </li>
        ))}
      </Box>
    </Box>
  )
}

export default ShareLinks
