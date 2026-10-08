/**
 * Adaptateur email de Payload.
 *
 * Choix : le relais SMTP de Brevo via `@payloadcms/email-nodemailer`, plutôt
 * qu'un adaptateur maison sur l'API transactionnelle de Brevo. Les deux passent
 * par la même infrastructure d'envoi, les mêmes quotas et les mêmes journaux
 * côté Brevo ; le relais SMTP est l'adaptateur officiellement maintenu par
 * Payload, donc tout ce qui envoie un email dans l'application (confirmation
 * d'abonnement, mais aussi réinitialisation de mot de passe de l'admin ou futur
 * plugin) emprunte un seul canal configuré à un seul endroit. L'API HTTP de
 * Brevo reste utilisée pour ce que le SMTP ne sait pas faire : gérer les
 * contacts de la liste de diffusion (`src/lib/newsletter/brevo.ts`).
 *
 * Réserve connue : certains hébergeurs sans serveur filtrent les connexions
 * sortantes en 587. Le jour où cela se produit, seul ce module change — tout
 * l'applicatif passe par `payload.sendEmail`.
 *
 * Sans identifiants SMTP (développement), on rend un adaptateur « console » qui
 * journalise l'email au lieu de l'envoyer : le parcours complet reste testable
 * sans compte Brevo, et l'avertissement « No email adapter provided » ne
 * réapparaît jamais. Le repli intégré à Payload ne convenait pas : il ne
 * journalise que le destinataire et l'objet, sans le corps du message — donc
 * sans le lien de confirmation, seul élément dont on a besoin en local.
 */

import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import type { EmailAdapter } from 'payload'

import { siteName } from '@/lib/site'

const DEFAULT_SMTP_HOST = 'smtp-relay.brevo.com'
const DEFAULT_SMTP_PORT = 587

const fromAddress = process.env.EMAIL_FROM || 'newsletter@localhost'
const fromName = process.env.EMAIL_FROM_NAME || siteName

/**
 * Repli de développement : l'email part dans les journaux du serveur, version
 * texte comprise, avec le lien de confirmation directement cliquable dans le
 * terminal.
 */
const consoleAdapter: EmailAdapter = ({ payload }) => ({
  name: 'console-dev',
  defaultFromAddress: fromAddress,
  defaultFromName: fromName,
  sendEmail: async (message) => {
    payload.logger.info(
      [
        '───── Email (mode console : aucun envoi réel) ─────',
        `À       : ${Array.isArray(message.to) ? message.to.join(', ') : String(message.to ?? '')}`,
        `Objet   : ${message.subject ?? ''}`,
        '',
        typeof message.text === 'string' ? message.text : '(pas de version texte)',
        '───────────────────────────────────────────────────',
      ].join('\n'),
    )

    return { skipped: true }
  },
})

/** Les deux identifiants SMTP doivent être présents pour tenter un envoi réel. */
export const hasSmtpCredentials = (): boolean =>
  Boolean(process.env.SMTP_USER && process.env.SMTP_PASSWORD)

export const emailAdapter = (): EmailAdapter | Promise<EmailAdapter> => {
  if (!hasSmtpCredentials()) return consoleAdapter

  return nodemailerAdapter({
    defaultFromAddress: fromAddress,
    defaultFromName: fromName,
    transportOptions: {
      host: process.env.SMTP_HOST || DEFAULT_SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || DEFAULT_SMTP_PORT,
      // Brevo écoute en STARTTLS sur 587 : la connexion démarre en clair puis
      // passe en TLS, `secure: false` est donc la valeur attendue ici.
      secure: false,
      auth: {
        user: process.env.SMTP_USER as string,
        pass: process.env.SMTP_PASSWORD as string,
      },
    },
  })
}
