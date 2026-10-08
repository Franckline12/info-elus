import type { Metadata } from 'next'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import LinkOffIcon from '@mui/icons-material/LinkOff'

import AppLink from '@/components/AppLink'
import NewsletterForm from '@/components/NewsletterForm'
import NewsletterStatus from '@/components/newsletter/NewsletterStatus'
import { NEWSLETTER_FREQUENCY } from '@/lib/newsletter/messages'
import { confirmSubscription } from '@/lib/newsletter/subscribers'
import { guidesPath, quizzesPath } from '@/lib/routes'
import { colors, radius } from '@/theme/tokens'

/**
 * Second temps du double opt-in (§ 4.4) : la page que l'on atteint depuis le
 * lien reçu par email.
 *
 * Page serveur — elle traite le jeton au rendu, par la même fonction que la
 * route `/api/newsletter/confirm`. Seul le formulaire de renvoi, affiché quand
 * le lien a expiré, est un composant client.
 *
 * `force-dynamic` : la page écrit en base (c'est là que le consentement est
 * enregistré), elle ne doit donc jamais être mise en cache ni prérendue.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Confirmation d’inscription',
  // Page transactionnelle, à usage unique : rien à indexer.
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ token?: string }>
}

/** Encart sobre pour redemander un email quand le lien n'est plus valable. */
function RetryForm() {
  return (
    <Box
      sx={{
        mt: 3,
        px: { xs: 2.5, sm: 3 },
        py: { xs: 2.5, sm: 3 },
        bgcolor: colors.blueDeep,
        color: colors.paper,
        borderRadius: `${radius}px`,
        '& :focus-visible': { outlineColor: colors.paper },
      }}
    >
      <Typography component="h2" sx={{ fontSize: '1rem', fontWeight: 700, mb: 1.5 }}>
        Recevoir un nouveau lien
      </Typography>
      <NewsletterForm source="/newsletter/confirmation" />
    </Box>
  )
}

export default async function NewsletterConfirmationPage({ searchParams }: Props) {
  const { token } = await searchParams
  const outcome = await confirmSubscription(token ?? '')

  if (outcome === 'confirmed' || outcome === 'already-confirmed') {
    return (
      <NewsletterStatus
        title={
          outcome === 'confirmed'
            ? 'Votre inscription est confirmée'
            : 'Votre inscription était déjà confirmée'
        }
        tone="success"
        icon={<CheckCircleOutlinedIcon sx={{ fontSize: '2.25rem' }} />}
      >
        <Typography variant="lede" component="p" sx={{ mb: 2 }}>
          {`Vous recevrez la lettre d’Infos Élus ${NEWSLETTER_FREQUENCY} : l’actualité juridique du CSE, les nouveaux guides pratiques et le quiz de la semaine.`}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Chaque envoi contient un lien de désinscription : vous pouvez partir en un clic, à tout
          moment, sans avoir à nous écrire.
        </Typography>

        <Typography variant="body2" sx={{ m: 0 }}>
          En attendant la prochaine lettre : <AppLink href={guidesPath}>les guides CSE</AppLink> ou{' '}
          <AppLink href={quizzesPath}>le quiz de la semaine</AppLink>.
        </Typography>
      </NewsletterStatus>
    )
  }

  if (outcome === 'expired') {
    return (
      <NewsletterStatus
        title="Ce lien a expiré"
        tone="warning"
        icon={<HourglassEmptyIcon sx={{ fontSize: '2.25rem' }} />}
      >
        <Typography variant="lede" component="p" sx={{ mb: 2 }}>
          Un lien de confirmation reste valable sept jours. Celui que vous venez d’ouvrir est plus
          ancien : votre inscription n’a donc pas été enregistrée.
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', m: 0 }}>
          Saisissez à nouveau votre adresse ci-dessous, nous vous renvoyons un lien tout de suite.
        </Typography>

        <RetryForm />
      </NewsletterStatus>
    )
  }

  return (
    <NewsletterStatus
      title="Ce lien n’est plus valable"
      icon={<LinkOffIcon sx={{ fontSize: '2.25rem' }} />}
    >
      <Typography variant="lede" component="p" sx={{ mb: 2 }}>
        Ce lien de confirmation est inconnu, ou il a déjà servi.
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0 }}>
        Si vous venez de confirmer votre inscription, tout va bien : un lien ne fonctionne qu’une
        fois, et la vôtre est bien enregistrée. Dans le doute, redemandez un email ci-dessous — une
        adresse déjà inscrite ne recevra rien de plus.
      </Typography>

      <RetryForm />
    </NewsletterStatus>
  )
}
