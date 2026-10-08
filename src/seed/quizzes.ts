import type { Payload } from 'payload'

import { ensureThemes, type SeedTheme } from './taxonomies'

/**
 * Jeu de quiz de démonstration (§ 2.5) : trois quiz publiés de cinq questions,
 * sur trois thèmes différents, chacune avec son explication rédigée.
 *
 * Quelques parties fictives sont enregistrées dans la foulée pour que le
 * compteur communautaire n'affiche pas zéro sur un site de démonstration.
 *
 * Le script est rejouable : les quiz portant ces slugs — et les résultats qui
 * s'y rattachent — sont supprimés avant d'être recréés.
 */

type SeedOption = {
  text: string
  isCorrect?: boolean
}

type SeedQuestion = {
  prompt: string
  options: SeedOption[]
  explanation: string
}

type SeedQuiz = {
  slug: string
  title: string
  intro: string
  themeSlug: string
  /** Lundi de la semaine concernée. */
  week: string
  publishedAt: string
  questions: SeedQuestion[]
  /** Parties fictives : scores obtenus, dans l'ordre. */
  plays: { score: number; cseName?: string }[]
}

const THEMES: SeedTheme[] = [
  { slug: 'elections', name: 'Élections', color: 'blue-bright' },
  { slug: 'budget-finances', name: 'Budget & finances', color: 'blue-mid' },
  { slug: 'sante-securite', name: 'Santé & sécurité', color: 'blue-deep' },
]

const QUIZZES: SeedQuiz[] = [
  {
    slug: 'elections-du-cse-les-fondamentaux',
    title: 'Élections du CSE : les fondamentaux',
    intro:
      'Seuils, délais, protocole préélectoral : cinq questions pour vérifier que vous maîtrisez le calendrier d’un scrutin.',
    themeSlug: 'elections',
    week: '2026-09-21T00:00:00.000Z',
    publishedAt: '2026-09-21T07:00:00.000Z',
    questions: [
      {
        prompt:
          'À partir de quel effectif, et pendant combien de temps, la mise en place d’un CSE devient-elle obligatoire ?',
        options: [
          { text: '11 salariés pendant 12 mois consécutifs', isCorrect: true },
          { text: '20 salariés pendant 6 mois consécutifs' },
          { text: '50 salariés pendant 12 mois consécutifs' },
          { text: '11 salariés dès le premier mois' },
        ],
        explanation:
          'Le CSE est obligatoire dès que l’entreprise atteint 11 salariés pendant douze mois consécutifs. Le seuil de 50 salariés ne conditionne pas l’existence du comité, mais l’étendue de ses attributions et ses budgets.',
      },
      {
        prompt: 'Quelle est la durée de droit commun du mandat des élus du CSE ?',
        options: [
          { text: 'Deux ans' },
          { text: 'Quatre ans', isCorrect: true },
          { text: 'Cinq ans' },
          { text: 'Six ans' },
        ],
        explanation:
          'Le mandat dure quatre ans. Un accord de branche, de groupe ou d’entreprise peut le raccourcir, sans descendre en dessous de deux ans.',
      },
      {
        prompt:
          'Combien de jours avant le premier tour l’employeur doit-il informer le personnel de l’organisation des élections ?',
        options: [
          { text: '30 jours' },
          { text: '45 jours' },
          { text: '90 jours', isCorrect: true },
          { text: '120 jours' },
        ],
        explanation:
          'L’information du personnel intervient au plus tard quatre-vingt-dix jours avant le premier tour. C’est ce délai qui commande tout le rétroplanning électoral.',
      },
      {
        prompt: 'Qui négocie le protocole d’accord préélectoral ?',
        options: [
          { text: 'L’employeur et les salariés réunis en assemblée générale' },
          {
            text: 'L’employeur et les organisations syndicales invitées à négocier',
            isCorrect: true,
          },
          { text: 'L’inspection du travail et l’employeur' },
          { text: 'Les seuls candidats déclarés au premier tour' },
        ],
        explanation:
          'Le protocole se négocie entre l’employeur et les organisations syndicales invitées. Il fixe la répartition du personnel entre collèges, celle des sièges, et les modalités du scrutin.',
      },
      {
        prompt: 'Dans quel cas un second tour doit-il être organisé ?',
        options: [
          { text: 'Lorsque le quorum n’est pas atteint au premier tour', isCorrect: true },
          { text: 'Lorsqu’un seul syndicat a présenté une liste' },
          { text: 'Systématiquement, quinze jours après le premier tour' },
          { text: 'Lorsque l’employeur le demande' },
        ],
        explanation:
          'Le quorum est atteint quand au moins la moitié des électeurs inscrits ont voté. À défaut — ou si des sièges restent vacants — un second tour est organisé, ouvert aux candidatures libres.',
      },
    ],
    plays: [
      { score: 5, cseName: 'CSE Groupe Lumen' },
      { score: 4, cseName: 'CSE Atelier Nord' },
      { score: 3 },
      { score: 5, cseName: 'CSE Groupe Lumen' },
      { score: 2 },
      { score: 4 },
      { score: 3, cseName: 'CSE Maison Verrier' },
      { score: 5 },
      { score: 1 },
      { score: 4, cseName: 'CSE Atelier Nord' },
      { score: 3 },
      { score: 4 },
    ],
  },
  {
    slug: 'les-deux-budgets-du-cse',
    title: 'Les deux budgets du CSE',
    intro:
      'Subvention de fonctionnement, activités sociales et culturelles, transferts d’excédents : testez votre lecture des comptes.',
    themeSlug: 'budget-finances',
    week: '2026-09-14T00:00:00.000Z',
    publishedAt: '2026-09-14T07:00:00.000Z',
    questions: [
      {
        prompt:
          'Quel est le taux de la subvention de fonctionnement dans une entreprise de 50 à 2 000 salariés ?',
        options: [
          { text: '0,20 % de la masse salariale brute', isCorrect: true },
          { text: '0,22 % de la masse salariale brute' },
          { text: '1 % de la masse salariale brute' },
          { text: 'Un montant fixé librement par l’employeur' },
        ],
        explanation:
          'La subvention de fonctionnement s’élève à 0,20 % de la masse salariale brute, portée à 0,22 % dans les entreprises d’au moins 2 000 salariés.',
      },
      {
        prompt: 'À partir de quel effectif le CSE dispose-t-il de la personnalité civile ?',
        options: [
          { text: '11 salariés' },
          { text: '20 salariés' },
          { text: '50 salariés', isCorrect: true },
          { text: '300 salariés' },
        ],
        explanation:
          'C’est à partir de cinquante salariés que le CSE acquiert la personnalité civile, gère un patrimoine et perçoit ses budgets.',
      },
      {
        prompt:
          'Dans quelle limite l’excédent annuel du budget de fonctionnement peut-il être transféré vers les activités sociales et culturelles ?',
        options: [
          { text: 'Aucun transfert n’est possible' },
          { text: '10 % de l’excédent', isCorrect: true },
          { text: '50 % de l’excédent' },
          { text: 'La totalité de l’excédent' },
        ],
        explanation:
          'Le CSE peut transférer jusqu’à 10 % de l’excédent annuel du budget de fonctionnement vers le budget des activités sociales et culturelles. La décision se prend en séance et doit figurer au procès-verbal.',
      },
      {
        prompt: 'Existe-t-il un montant minimal légal pour le budget des activités sociales ?',
        options: [
          { text: 'Oui, 0,20 % de la masse salariale' },
          { text: 'Oui, 1 % de la masse salariale' },
          {
            text: 'Non : il résulte d’un accord ou de l’usage dans l’entreprise',
            isCorrect: true,
          },
          { text: 'Non, il est laissé à la libre appréciation du CSE' },
        ],
        explanation:
          'Aucun plancher légal n’existe. Le montant découle d’un accord d’entreprise ou de l’usage : la contribution ne peut pas être inférieure au total le plus élevé des trois dernières années.',
      },
      {
        prompt:
          'Quelle obligation comptable pèse sur un CSE dont les ressources annuelles ne dépassent pas 153 000 € ?',
        options: [
          { text: 'Aucune obligation comptable' },
          {
            text: 'Une comptabilité ultra-simplifiée : livre des recettes et dépenses, état de synthèse annuel',
            isCorrect: true,
          },
          { text: 'Des comptes annuels certifiés par un commissaire aux comptes' },
          { text: 'Un bilan et un compte de résultat détaillés' },
        ],
        explanation:
          'En dessous de 153 000 € de ressources, le CSE tient une comptabilité ultra-simplifiée et présente un état de synthèse annuel. Au-delà, les obligations s’alourdissent progressivement jusqu’à la certification des comptes.',
      },
    ],
    plays: [
      { score: 3, cseName: 'CSE Maison Verrier' },
      { score: 5 },
      { score: 2, cseName: 'CSE Atelier Nord' },
      { score: 4 },
      { score: 3 },
      { score: 4, cseName: 'CSE Groupe Lumen' },
      { score: 1 },
      { score: 3 },
      { score: 5, cseName: 'CSE Maison Verrier' },
      { score: 2 },
    ],
  },
  {
    slug: 'sante-securite-et-conditions-de-travail',
    title: 'Santé, sécurité et conditions de travail',
    intro:
      'CSSCT, droit d’alerte, enquêtes après accident : cinq questions sur la mission la plus exigeante du mandat.',
    themeSlug: 'sante-securite',
    week: '2026-09-07T00:00:00.000Z',
    publishedAt: '2026-09-07T07:00:00.000Z',
    questions: [
      {
        prompt:
          'À partir de quel effectif la commission santé, sécurité et conditions de travail est-elle obligatoire ?',
        options: [
          { text: '50 salariés' },
          { text: '100 salariés' },
          { text: '300 salariés', isCorrect: true },
          { text: '500 salariés' },
        ],
        explanation:
          'La CSSCT est obligatoire dans les entreprises d’au moins trois cents salariés, ainsi que sur les sites classés Seveso seuil haut. En deçà, elle peut être créée par accord ou à l’initiative de l’inspection du travail.',
      },
      {
        prompt:
          'Combien de réunions du CSE doivent au minimum porter sur la santé, la sécurité et les conditions de travail chaque année ?',
        options: [
          { text: 'Deux' },
          { text: 'Trois' },
          { text: 'Quatre', isCorrect: true },
          { text: 'Six' },
        ],
        explanation:
          'Quatre réunions annuelles au moins sont consacrées en tout ou partie à la santé, à la sécurité et aux conditions de travail — soit une par trimestre.',
      },
      {
        prompt:
          'Que fait un élu qui constate une cause de danger grave et imminent pour un salarié ?',
        options: [
          {
            text: 'Il alerte immédiatement l’employeur et consigne l’alerte sur un registre spécial',
            isCorrect: true,
          },
          { text: 'Il saisit directement le conseil de prud’hommes' },
          { text: 'Il attend la prochaine réunion du CSE pour en informer l’employeur' },
          { text: 'Il ordonne lui-même l’arrêt de la production' },
        ],
        explanation:
          'Le droit d’alerte s’exerce immédiatement auprès de l’employeur et se consigne sur un registre spécial. Une enquête est menée sans délai avec l’employeur ; en cas de désaccord, l’inspection du travail est saisie.',
      },
      {
        prompt: 'Qui assiste aux réunions consacrées à la santé et à la sécurité, avec voix consultative ?',
        options: [
          { text: 'Le médecin du travail et le responsable sécurité de l’entreprise', isCorrect: true },
          { text: 'Les représentants de proximité uniquement' },
          { text: 'Un expert-comptable désigné par le CSE' },
          { text: 'Le président du conseil d’administration' },
        ],
        explanation:
          'Le médecin du travail et le responsable interne du service de sécurité participent avec voix consultative. L’agent de contrôle de l’inspection du travail et l’agent de prévention de la caisse sont invités à ces réunions.',
      },
      {
        prompt: 'Après un accident du travail grave, qui mène l’enquête ?',
        options: [
          { text: 'L’employeur seul, qui en rend compte au CSE' },
          { text: 'Une délégation comprenant l’employeur et un membre élu du CSE', isCorrect: true },
          { text: 'L’inspection du travail exclusivement' },
          { text: 'La caisse d’assurance retraite et de la santé au travail' },
        ],
        explanation:
          'L’enquête est conduite conjointement par l’employeur — ou son représentant — et un membre élu du CSE. Ses conclusions alimentent le document unique d’évaluation des risques.',
      },
    ],
    plays: [
      { score: 4 },
      { score: 5, cseName: 'CSE Atelier Nord' },
      { score: 3 },
      { score: 2, cseName: 'CSE Groupe Lumen' },
      { score: 4 },
      { score: 3, cseName: 'CSE Maison Verrier' },
      { score: 5 },
      { score: 4 },
    ],
  },
]

/** Parties étalées sur les jours précédant la date de référence du seed. */
const playedAt = (week: string, offset: number): string => {
  const date = new Date(week)
  date.setUTCDate(date.getUTCDate() + 1 + (offset % 5))
  date.setUTCHours(9 + (offset % 8), (offset * 7) % 60, 0, 0)
  return date.toISOString()
}

export async function seedQuizzes(payload: Payload): Promise<void> {
  const themes = await ensureThemes(payload, THEMES)

  const slugs = QUIZZES.map((quiz) => quiz.slug)

  // Rejouable : les résultats rattachés aux quiz de démonstration partent avec
  // eux, sans quoi le compteur communautaire cumulerait les passages du seed.
  const { docs: existing } = await payload.find({
    collection: 'quizzes',
    where: { slug: { in: slugs } },
    limit: slugs.length,
    depth: 0,
  })

  if (existing.length > 0) {
    await payload.delete({
      collection: 'quiz-results',
      where: { quiz: { in: existing.map((quiz) => quiz.id) } },
    })

    await payload.delete({
      collection: 'quizzes',
      where: { slug: { in: slugs } },
      context: { disableRevalidate: true },
    })

    payload.logger.info(`${existing.length} quiz de démonstration remplacé(s)`)
  }

  for (const quiz of QUIZZES) {
    const themeId = themes.get(quiz.themeSlug)
    if (!themeId) throw new Error(`Thème introuvable pour le quiz « ${quiz.title} »`)

    const created = await payload.create({
      collection: 'quizzes',
      context: { disableRevalidate: true },
      data: {
        title: quiz.title,
        slug: quiz.slug,
        intro: quiz.intro,
        theme: themeId,
        week: quiz.week,
        publishedAt: quiz.publishedAt,
        questions: quiz.questions.map((question) => ({
          prompt: question.prompt,
          explanation: question.explanation,
          points: 1,
          options: question.options.map((option) => ({
            text: option.text,
            isCorrect: Boolean(option.isCorrect),
          })),
        })),
        _status: 'published',
      },
    })

    for (const [offset, play] of quiz.plays.entries()) {
      await payload.create({
        collection: 'quiz-results',
        data: {
          quiz: created.id,
          score: play.score,
          total: quiz.questions.length,
          ...(play.cseName ? { cseName: play.cseName } : {}),
          playedAt: playedAt(quiz.week, offset),
        },
      })
    }

    payload.logger.info(`Quiz publié : ${quiz.title} (${quiz.plays.length} parties fictives)`)
  }
}
