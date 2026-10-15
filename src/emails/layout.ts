/**
 * Gabarit HTML commun aux emails transactionnels d'Infos Élus.
 *
 * Les emails ne partagent rien avec le thème MUI : les clients de messagerie
 * ignorent les feuilles de style externes et une bonne partie du CSS moderne.
 * Les couleurs sont donc recopiées depuis les jetons (§ 5.1) sous forme de
 * styles en ligne, avec une mise en page en tableau, et le rendu reste lisible
 * si le client refuse le HTML — d'où la version texte obligatoire.
 */

import { colors } from '@/theme/tokens'
import { siteName, siteTagline } from '@/lib/site'

export type EmailContent = {
  subject: string
  html: string
  text: string
}

/** Échappe une valeur avant de l'insérer dans le HTML d'un email. */
export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export type EmailLayoutInput = {
  /** Titre affiché en haut du corps de l'email, déjà échappé si besoin. */
  heading: string
  /** Paragraphes du corps, en HTML (liens autorisés). */
  paragraphs: string[]
  button?: { label: string; url: string }
  /** Petites lignes grises en bas du corps, avant le pied de page. */
  footnotes?: string[]
}

const paragraph = (html: string): string => {
  const trimmed = html.trim()
  if (
    trimmed.startsWith('<div') ||
    trimmed.startsWith('<table') ||
    trimmed.startsWith('<section') ||
    trimmed.startsWith('<h2') ||
    trimmed.startsWith('<h3')
  ) {
    return html
  }
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${colors.ink};">${html}</p>`
}

const footnote = (html: string): string =>
  `<p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:${colors.textSecondary};">${html}</p>`

/**
 * Bouton « bulletproof » : un lien mis en boîte, seule forme de bouton qui
 * survive à Outlook. L'ocre des appels à l'action reprend la maquette.
 */
const button = ({ label, url }: { label: string; url: string }): string => `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
        <tr>
          <td style="background-color:${colors.accentQuiz};border-radius:4px;">
            <a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 28px;font-family:'Space Grotesk',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;color:${colors.ink};text-decoration:none;">${escapeHtml(label)}</a>
          </td>
        </tr>
      </table>`

export const renderEmailLayout = ({
  heading,
  paragraphs,
  button: cta,
  footnotes = [],
}: EmailLayoutInput): string => `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:${colors.paper};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${colors.paper};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background-color:${colors.paperRaised};border:1px solid rgba(16,21,43,0.12);border-radius:4px;font-family:'Space Grotesk',Helvetica,Arial,sans-serif;">
        <tr>
          <td style="padding:24px 32px;background-color:${colors.blueDeep};border-radius:4px 4px 0 0;">
            <div style="font-size:20px;font-weight:700;letter-spacing:0.02em;color:${colors.paper};">${escapeHtml(siteName)}</div>
            <div style="margin-top:4px;font-size:13px;color:${colors.bluePale};">${escapeHtml(siteTagline)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:${colors.ink};">${escapeHtml(heading)}</h1>
            ${paragraphs.map(paragraph).join('\n            ')}
            ${cta ? button(cta) : ''}
            ${footnotes.map(footnote).join('\n            ')}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid rgba(16,21,43,0.12);">
            <p style="margin:0;font-size:12px;line-height:1.5;color:${colors.textSecondary};">
              ${escapeHtml(siteName)} — ${escapeHtml(siteTagline)}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
