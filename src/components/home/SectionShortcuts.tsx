import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import AppLink from '@/components/AppLink'
import SectionGlyph from '@/components/SectionGlyph'
import { sectionShortcuts } from '@/lib/site'
import { colors, rule } from '@/theme/tokens'

/**
 * Les quatre accès aux grandes sections, séparés par des filets verticaux
 * (maquette, sous le bandeau d'accueil). Navigation pure : aucun contenu CMS.
 */
export function SectionShortcuts() {
  return (
    <Box
      component="nav"
      aria-label="Grandes sections du site"
      sx={{ borderBottom: `1px solid ${rule}` }}
    >
      <Box
        component="ul"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          listStyle: 'none',
          m: 0,
          p: 0,
        }}
      >
        {sectionShortcuts.map((item, index) => (
          <Box
            component="li"
            key={item.href}
            sx={{
              borderTop: `1px solid ${rule}`,
              borderLeft: { sm: index % 2 === 1 ? `1px solid ${rule}` : 'none', md: 'none' },
              // Filets verticaux à partir de 900px, sauf devant la première colonne.
              '&:not(:first-of-type)': { borderLeft: { md: `1px solid ${rule}` } },
            }}
          >
            <AppLink
              href={item.href}
              underline="none"
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                height: '100%',
                px: { xs: 0, md: 2.5 },
                py: { xs: 2, md: 2.5 },
                color: 'text.primary',
                '&:hover .shortcut-title': { color: 'primary.main' },
              }}
            >
              <Box
                aria-hidden
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  width: 34,
                  height: 34,
                  borderRadius: '4px',
                  backgroundColor: colors.bluePale,
                  color: colors.blueMid,
                }}
              >
                <SectionGlyph name={item.icon} fontSize="small" />
              </Box>

              <Box>
                <Typography
                  component="span"
                  className="shortcut-title"
                  sx={{ display: 'block', fontSize: '0.9375rem', fontWeight: 700, mb: 0.25 }}
                >
                  {item.label}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    lineHeight: 1.45,
                    color: 'text.secondary',
                  }}
                >
                  {item.description}
                </Typography>
              </Box>
            </AppLink>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default SectionShortcuts
