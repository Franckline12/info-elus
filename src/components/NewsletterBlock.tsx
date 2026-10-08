import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'

import NewsletterForm from '@/components/NewsletterForm'
import { NEWSLETTER_FREQUENCY } from '@/lib/newsletter/messages'
import { colors, radius } from '@/theme/tokens'

type Props = {
  /** Page d'où vient la demande, enregistrée avec l'abonné. */
  source?: string
  /** Niveau de titre, à ajuster selon la hiérarchie de la page d'accueil. */
  component?: 'h2' | 'h3'
  /** Identifiant du titre, cible du `aria-labelledby` de la section. */
  headingId?: string
}

/**
 * Bloc large d'inscription à la lettre hebdomadaire (§ 2.6) : accueil et bas
 * des pages article et guide. Le pied de page utilise la variante compacte du
 * formulaire, sans ce cadre.
 *
 * Composant serveur qui enveloppe un composant client : seul le formulaire
 * descend dans le navigateur.
 */
export function NewsletterBlock({
  source,
  component = 'h2',
  headingId = 'newsletter-titre',
}: Props) {
  return (
    <Box
      component="section"
      id="newsletter"
      aria-labelledby={headingId}
      sx={{
        height: '100%',
        bgcolor: colors.blueDeep,
        color: colors.paper,
        borderRadius: `${radius}px`,
        px: { xs: 2.5, sm: 3.5, md: 4 },
        py: { xs: 3, md: 3.5 },
        '& :focus-visible': { outlineColor: colors.paper },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
        <Box
          aria-hidden
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: 'rgba(228, 233, 251, 0.16)',
            color: colors.bluePale,
          }}
        >
          <EmailOutlinedIcon fontSize="small" />
        </Box>

        <Box>
          <Typography
            id={headingId}
            component={component}
            sx={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.2, mb: 0.75 }}
          >
            Recevez notre newsletter
          </Typography>
          <Typography
            component="p"
            sx={{ color: colors.bluePale, fontSize: '0.875rem', m: 0, maxWidth: '46ch' }}
          >
            {`Actualité juridique, guides et quiz de la semaine : l’essentiel du CSE ${NEWSLETTER_FREQUENCY}, dans votre boîte email.`}
          </Typography>
        </Box>
      </Box>

      <NewsletterForm source={source} />
    </Box>
  )
}

export default NewsletterBlock
