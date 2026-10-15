/**
 * Email d'envoi des résultats d'un quiz à un joueur (§ 2.5).
 */

import { renderEmailLayout, escapeHtml, type EmailContent } from './layout'
import { colors } from '@/theme/tokens'
import { siteName } from '@/lib/site'

export type QuizQuestionReview = {
  questionNumber: number
  prompt: string
  isCorrect: boolean
  userAnswer: string
  correctAnswer: string
  explanation?: string | null
}

export type QuizResultEmailInput = {
  recipientName: string
  quizTitle: string
  score: number
  total: number
  correctCount: number
  questionCount: number
  questions?: QuizQuestionReview[]
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
  questions = [],
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

  let questionsHtml = ''
  if (questions.length > 0) {
    const questionsListHtml = questions
      .map((q) => {
        const badgeColor = q.isCorrect ? '#2E7D32' : '#C62828'
        const badgeText = q.isCorrect ? '✓ Bonne réponse' : '✗ Réponse incorrecte'

        const answersBlock = q.isCorrect
          ? `
            <div style="margin:0 0 6px;font-size:14px;line-height:1.5;color:${colors.ink};">
              <strong style="color:#2E7D32;">Votre réponse :</strong> ${escapeHtml(q.userAnswer)}
            </div>
          `
          : `
            <div style="margin:0 0 6px;font-size:14px;line-height:1.5;color:${colors.ink};">
              <strong style="color:#C62828;">Votre réponse :</strong> ${escapeHtml(q.userAnswer)}
            </div>
            <div style="margin:0 0 8px;font-size:14px;line-height:1.5;color:${colors.ink};">
              <strong style="color:#2E7D32;">Bonne réponse :</strong> ${escapeHtml(q.correctAnswer)}
            </div>
          `

        const explanationBlock = q.explanation
          ? `
            <div style="margin-top:10px;padding:10px 12px;background-color:#F5F5F5;border-left:3px solid ${colors.blueMid};border-radius:2px;font-size:13px;color:${colors.textSecondary};line-height:1.5;">
              <strong style="color:${colors.ink};">Explication :</strong> ${escapeHtml(q.explanation)}
            </div>
          `
          : ''

        return `
          <div style="margin:0 0 16px;padding:16px;background-color:#FFFFFF;border:1px solid rgba(16,21,43,0.12);border-left:4px solid ${badgeColor};border-radius:4px;">
            <div style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${badgeColor};">
              ${badgeText} — Question ${q.questionNumber}
            </div>
            <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:${colors.ink};line-height:1.4;">
              ${escapeHtml(q.prompt)}
            </p>
            ${answersBlock}
            ${explanationBlock}
          </div>
        `
      })
      .join('\n')

    questionsHtml = `
      <div style="margin:28px 0 20px;">
        <h2 style="margin:0 0 16px;font-size:18px;font-weight:700;color:${colors.ink};line-height:1.3;border-bottom:2px solid ${colors.blueDeep};padding-bottom:8px;">
          Détail de vos réponses
        </h2>
        ${questionsListHtml}
      </div>
    `
  }

  const conclusion =
    'Retrouvez tous nos quiz, nos guides pratiques et l’actualité juridique du CSE sur notre site.'

  const paragraphs = [
    escapeHtml(intro),
    resultText,
    ...(cseText ? [cseText] : []),
    scoreSummary,
    ...(questionsHtml ? [questionsHtml] : []),
    escapeHtml(conclusion),
  ]

  const button = quizUrl ? { label: 'Revoir le quiz', url: quizUrl } : undefined

  // Version texte détaillée pour les clients mail sans HTML
  const textQuestions =
    questions.length > 0
      ? [
          '',
          '--- DÉTAIL DE VOS RÉPONSES ---',
          '',
          ...questions.flatMap((q) => [
            `Question ${q.questionNumber} : ${q.prompt}`,
            `Résultat : ${q.isCorrect ? 'Bonne réponse' : 'Réponse incorrecte'}`,
            `Votre réponse : ${q.userAnswer}`,
            ...(!q.isCorrect ? [`Bonne réponse : ${q.correctAnswer}`] : []),
            ...(q.explanation ? [`Explication : ${q.explanation}`] : []),
            '',
          ]),
          '------------------------------',
        ]
      : []

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
      ...textQuestions,
      '',
      conclusion,
      quizUrl ? `Lien vers le quiz : ${quizUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  }
}
