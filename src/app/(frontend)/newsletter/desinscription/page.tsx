import type { Metadata } from 'next'
import Typography from '@mui/material/Typography'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import UnsubscribeOutlinedIcon from '@mui/icons-material/UnsubscribeOutlined'

import AppLink from '@/components/AppLink'
import NewsletterStatus from '@/components/newsletter/NewsletterStatus'
import { unsubscribeByToken } from '@/lib/newsletter/subscribers'
import { guidesPath } from '@/lib/routes'

/**
 * Désinscription de la lettre hebdomadaire (§ 4.4 : partir doit être aussi
 * simple qu'arriver — un lien, aucun compte, aucun mot de passe, aucune
 * question).
 *
 * Page serveur : le jeton est traité au rendu par la même fonction que la route
 * `/api/newsletter/unsubscribe`. Aucun composant client ici — proposer de se
 * réinscrire est un lien, pas un formulaire : insister serait déplacé.
 *
 * Réserve assumée : une action qui modifie l'état depuis un simple GET peut
 * être déclenchée par un outil qui précharge les liens d'un email. Le risque
 * est une désinscription non voulue, jamais une inscription — c'est le sens
 * que le RGPD donne à la priorité. La route POST existe à côté pour les clients
 * de messagerie qui savent faire du `List-Unsubscribe-Post`.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Désinscription',
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ token?: string }>
}

export default async function NewsletterUnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams
  const outcome = await unsubscribeByToken(token ?? '')

  if (outcome === 'invalid') {
    return (
      <NewsletterStatus
        title="Ce lien de désinscription n’est plus valable"
        icon={<LinkOffIcon sx={{ fontSize: '2.25rem' }} />}
      >
        <Typography variant="lede" component="p" sx={{ mb: 2 }}>
          Nous ne reconnaissons pas ce lien. Il peut venir d’un email très ancien, ou avoir été
          tronqué par votre logiciel de messagerie.
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', m: 0 }}>
          Ouvrez le lien de désinscription de votre dernière lettre, ou écrivez-nous depuis la{' '}
          <AppLink href="/contact">page Contact</AppLink> : nous ferons le nécessaire.
        </Typography>
      </NewsletterStatus>
    )
  }

  const already = outcome === 'already-unsubscribed'

  return (
    <NewsletterStatus
      title={already ? 'Vous étiez déjà désinscrit' : 'Vous êtes désinscrit'}
      icon={
        already ? (
          <MarkEmailReadOutlinedIcon sx={{ fontSize: '2.25rem' }} />
        ) : (
          <UnsubscribeOutlinedIcon sx={{ fontSize: '2.25rem' }} />
        )
      }
    >
      <Typography variant="lede" component="p" sx={{ mb: 2 }}>
        {already
          ? 'Cette adresse ne reçoit plus la lettre d’Infos Élus. Il n’y a rien d’autre à faire.'
          : 'C’est fait : cette adresse ne recevra plus la lettre d’Infos Élus.'}
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Le site reste en accès libre : articles, guides et quiz n’ont jamais demandé d’inscription.
      </Typography>

      <Typography variant="body2" sx={{ m: 0 }}>
        Si vous changez d’avis, <AppLink href="/#newsletter">réinscrivez-vous ici</AppLink> — ou
        passez simplement voir <AppLink href={guidesPath}>les guides CSE</AppLink>.
      </Typography>
    </NewsletterStatus>
  )
}
