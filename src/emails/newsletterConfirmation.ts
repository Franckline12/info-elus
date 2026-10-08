/**
 * Email de confirmation du double opt-in (§ 4.4).
 *
 * C'est le seul message envoyé avant confirmation, et il n'a rien de
 * commercial : il explique pourquoi il arrive, ce à quoi la personne s'engage,
 * et se referme sur « ignorez cet email » si la demande ne vient pas d'elle.
 */

import { renderEmailLayout, escapeHtml, type EmailContent } from './layout'
import { siteName } from '@/lib/site'

export type ConfirmationEmailInput = {
  /** URL absolue de confirmation, jeton compris. */
  confirmationUrl: string
}

const HEADING = 'Confirmez votre inscription'

const INTRO =
  'Vous recevez cet email parce que cette adresse a été utilisée pour s’inscrire à la lettre hebdomadaire d’Infos Élus, le média des élus de CSE.'

const WHAT =
  'Une fois votre inscription confirmée, vous recevrez une lettre par semaine : l’actualité juridique du CSE, les nouveaux guides pratiques et le quiz de la semaine. Rien d’autre, et vous pourrez vous désinscrire en un clic depuis chaque envoi.'

const ACTION = 'Pour valider votre inscription, cliquez sur le bouton ci-dessous.'

const VALIDITY =
  'Ce lien est valable 7 jours. Passé ce délai, il suffit de redemander un email depuis le site.'

const IGNORE =
  'Si vous n’êtes pas à l’origine de cette demande, ignorez simplement cet email : sans confirmation de votre part, aucune lettre ne vous sera envoyée et votre adresse sera effacée.'

export const buildConfirmationEmail = ({
  confirmationUrl,
}: ConfirmationEmailInput): EmailContent => ({
  subject: `Confirmez votre inscription à la lettre ${siteName}`,
  html: renderEmailLayout({
    heading: HEADING,
    paragraphs: [escapeHtml(INTRO), escapeHtml(WHAT), escapeHtml(ACTION)],
    button: { label: 'Je confirme mon inscription', url: confirmationUrl },
    footnotes: [
      `Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br><a href="${escapeHtml(confirmationUrl)}" style="color:#3E63E0;word-break:break-all;">${escapeHtml(confirmationUrl)}</a>`,
      escapeHtml(VALIDITY),
      escapeHtml(IGNORE),
    ],
  }),
  text: [
    `${siteName} — ${HEADING}`,
    '',
    INTRO,
    '',
    WHAT,
    '',
    `${ACTION.replace('cliquez sur le bouton ci-dessous.', 'ouvrez ce lien :')}`,
    confirmationUrl,
    '',
    VALIDITY,
    '',
    IGNORE,
  ].join('\n'),
})
