import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import XIcon from '@mui/icons-material/X'
import YouTubeIcon from '@mui/icons-material/YouTube'
import type { SvgIconProps } from '@mui/material/SvgIcon'

import { socialLinks } from '@/lib/site'
import type { SocialLink } from '@/lib/site'
import { colors, ruleOnDeep } from '@/theme/tokens'

const ICONS: Record<SocialLink['network'], React.ComponentType<SvgIconProps>> = {
  linkedin: LinkedInIcon,
  x: XIcon,
  youtube: YouTubeIcon,
}

/**
 * Comptes sociaux du pied de page. Rien n'est rendu tant que `socialLinks` est
 * vide : les URL doivent venir du client, on ne publie pas de lien factice.
 */
export function SocialLinks() {
  if (socialLinks.length === 0) return null

  return (
    <Box
      component="ul"
      sx={{ display: 'flex', alignItems: 'center', gap: 1, listStyle: 'none', m: 0, p: 0 }}
    >
      {socialLinks.map((link) => {
        const Icon = ICONS[link.network]

        return (
          <li key={link.href}>
            <IconButton
              component="a"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${link.label} (nouvelle fenêtre)`}
              size="small"
              sx={{
                color: colors.paper,
                border: `1px solid ${ruleOnDeep}`,
                borderRadius: '50%',
                '&:hover': { backgroundColor: 'rgba(243, 240, 230, 0.12)' },
              }}
            >
              <Icon fontSize="small" />
            </IconButton>
          </li>
        )
      })}
    </Box>
  )
}

export default SocialLinks
