import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import MailOutlinedIcon from '@mui/icons-material/MailOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'

import AppLink from '@/components/AppLink'
import VisuallyHidden from '@/components/VisuallyHidden'
import type { Provider } from '@/payload-types'
import { colors, radius, rule, surfaceBorder } from '@/theme/tokens'

type Props = {
  contact: NonNullable<Provider['contact']>
  /** Nom du prestataire, rappelé dans l'objet du courriel. */
  name: string
  id?: string
}

/** Nom d'hôte sans `www.`, plus lisible qu'une URL complète. */
const displayHost = (website: string): string => {
  try {
    return new URL(website).host.replace(/^www\./, '')
  } catch {
    return website
  }
}

/**
 * Numéro utilisable dans un `tel:` : les espaces et les points de séparation
 * n'ont de sens que pour l'œil.
 */
const telHref = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, '')}`

const ROW = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  alignItems: 'baseline',
  gap: 1.25,
  py: 1.25,
} as const

/**
 * Bloc de mise en relation d'une fiche (§ 2.4 : « coordonnées/lien de
 * contact »). Chaque coordonnée est actionnable — `mailto:`, `tel:`, lien
 * externe — plutôt que simplement écrite.
 *
 * Le lien vers le site du prestataire ouvre un onglet : il est signalé par une
 * icône et par une mention lue par les lecteurs d'écran, l'icône seule ne
 * suffisant pas (§ 4.5).
 */
export function ProviderContact({ contact, name, id }: Props) {
  const { contactName, email, phone, website } = contact
  const hasAny = Boolean(email || phone || website)

  if (!hasAny) return null

  return (
    <Box
      component="section"
      aria-labelledby={id}
      sx={{
        border: `1px solid ${surfaceBorder}`,
        borderRadius: `${radius}px`,
        backgroundColor: colors.paperRaised,
        px: { xs: 2, md: 2.5 },
        py: { xs: 1.5, md: 2 },
      }}
    >
      <Typography id={id} component="h2" sx={{ fontSize: '0.9375rem', fontWeight: 700, mb: 0.5 }}>
        Contacter ce prestataire
      </Typography>

      {contactName ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
          Votre interlocuteur : {contactName}
        </Typography>
      ) : null}

      <Box component="dl" sx={{ m: 0, '& > div + div': { borderTop: `1px solid ${rule}` } }}>
        {email ? (
          <Box sx={ROW}>
            <Box component="dt" sx={{ display: 'flex', color: 'text.secondary' }}>
              <MailOutlinedIcon aria-hidden sx={{ fontSize: '1.125rem' }} />
              <VisuallyHidden>Email</VisuallyHidden>
            </Box>
            <Box component="dd" sx={{ m: 0, minWidth: 0, overflowWrap: 'anywhere' }}>
              <AppLink href={`mailto:${email}?subject=${encodeURIComponent(name)}`}>
                {email}
              </AppLink>
            </Box>
          </Box>
        ) : null}

        {phone ? (
          <Box sx={ROW}>
            <Box component="dt" sx={{ display: 'flex', color: 'text.secondary' }}>
              <PhoneOutlinedIcon aria-hidden sx={{ fontSize: '1.125rem' }} />
              <VisuallyHidden>Téléphone</VisuallyHidden>
            </Box>
            <Box component="dd" sx={{ m: 0 }}>
              <AppLink href={telHref(phone)}>{phone}</AppLink>
            </Box>
          </Box>
        ) : null}

        {website ? (
          <Box sx={ROW}>
            <Box component="dt" sx={{ display: 'flex', color: 'text.secondary' }}>
              <PublicOutlinedIcon aria-hidden sx={{ fontSize: '1.125rem' }} />
              <VisuallyHidden>Site web</VisuallyHidden>
            </Box>
            <Box component="dd" sx={{ m: 0, minWidth: 0, overflowWrap: 'anywhere' }}>
              <AppLink
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.5 }}
              >
                {displayHost(website)}
                <OpenInNewIcon aria-hidden sx={{ fontSize: '0.875em', flexShrink: 0 }} />
                <VisuallyHidden>(site externe, s’ouvre dans un nouvel onglet)</VisuallyHidden>
              </AppLink>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}

export default ProviderContact
