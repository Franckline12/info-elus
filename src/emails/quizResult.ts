/**
 * Email d'envoi des résultats d'un quiz à un joueur (§ 2.5).
 */

import { renderEmailLayout, escapeHtml, type EmailContent } from './layout'
import { siteName } from '@/lib/site'

export type QuizResultEmailInput = {
  recipientName: string
  quizTitle: string
  score: number
  total: number
  correctCount: number
  questionCount: number
  companyCse?: string | null
  quizUrl?: string
}

export const buildQuizResultEmail = ({
  recipientName,
  quizTitle,
  score,
  total,
  correctCount,
  questionCount,
  companyCse,
  quizUrl,
}: QuizResultEmailInput): EmailContent => {
  const heading = `Vos résultats au quiz : ${quizTitle}`

  const intro = `Bonjour ${recipientName},`
  const resultText = `Vous venez de compléter le quiz <strong>« ${escapeHtml(
    quizTitle,
  )} »</strong> sur ${escapeHtml(siteName)}.`

  const cseText = companyCse
    ? `Entreprise / CSE renseigné : <strong>${escapeHtml(companyCse)}</strong>.`
    : ''

  const scoreSummary = `
    <div style="margin:20px 0;padding:20px;background-color:#FAF2E2;border-left:4px solid #E3A23E;border-radius:4px;">
      <p style="margin:0 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#565C78;font-weight:700;">Votre score</p>
      <p style="margin:0;font-size:32px;font-weight:700;color:#10152B;line-height:1.1;">
        ${score} / ${total} points
      </p>
      <p style="margin:8px 0 0;font-size:15px;color:#565C78;">
        ${correctCount} bonne${correctCount > 1 ? 's' : ''} réponse${
    correctCount > 1 ? 's' : ''
  } sur ${questionCount} questions.
      </p>
    </div>
  `

  const conclusion =
    'Retrouvez tous nos quiz, nos guides pratiques et l’actualité juridique du CSE sur notre site.'

  const paragraphs = [
    escapeHtml(intro),
    resultText,
    ...(cseText ? [cseText] : []),
    scoreSummary,
    escapeHtml(conclusion),
  ]

  const button = quizUrl ? { label: 'Revoir le quiz', url: quizUrl } : undefined

  return {
    subject: `Vos résultats : ${quizTitle} — ${siteName}`,
    html: renderEmailLayout({
      heading,
      paragraphs,
      button,
      footnotes: [
        'Cet email vous a été envoyé automatiquement suite à votre demande sur Infos Élus.',
      ],
    }),
    text: [
      `${siteName} — ${heading}`,
      '',
      intro,
      '',
      `Vous venez de compléter le quiz « ${quizTitle} » sur ${siteName}.`,
      companyCse ? `Entreprise / CSE : ${companyCse}` : '',
      '',
      `Score : ${score} / ${total} points (${correctCount} bonnes réponses sur ${questionCount} questions).`,
      '',
      conclusion,
      quizUrl ? `Lien vers le quiz : ${quizUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  }
}
