import { unstable_cache } from 'next/cache'

import { getPayloadClient } from './payload'

/**
 * Compteur communautaire du § 2.5 : nombre de parties jouées et taux de bonnes
 * réponses, pour un quiz ou pour l'ensemble du site.
 *
 * L'agrégation est faite par PostgreSQL — `COUNT` et `SUM` sur `quiz_results` —
 * plutôt qu'en chargeant les résultats en mémoire : la table grossit d'une
 * ligne par partie, et le compteur s'affiche sur la page d'accueil.
 *
 * Le résultat est mis en cache cinq minutes : un compteur communautaire n'a pas
 * besoin d'être exact à la seconde, et la page d'accueil ne doit pas relancer
 * l'agrégation à chaque visite.
 */

const CACHE_TTL_SECONDS = 300

export const QUIZ_STATS_TAG = 'quiz-stats'

export type QuizStats = {
  /** Nombre de parties enregistrées. */
  plays: number
  /** Points obtenus, cumulés. */
  score: number
  /** Points maximum, cumulés. */
  total: number
  /** Taux de bonnes réponses, en pourcentage entier (0 quand aucune partie). */
  successRate: number
}

const EMPTY: QuizStats = { plays: 0, score: 0, total: 0, successRate: 0 }

type Row = { plays: string | number; score: string | number; total: string | number }

const toNumber = (value: string | number | null | undefined): number => {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const readStats = async (quizId?: number): Promise<QuizStats> => {
  const payload = await getPayloadClient()

  // Le nom de table est résolu par l'adaptateur plutôt que codé en dur : il
  // dépend du slug de la collection et d'un éventuel préfixe.
  const table = payload.db.tableNameMap.get('quiz_results') ?? 'quiz_results'

  const filter = typeof quizId === 'number' ? ' WHERE quiz_id = $1' : ''

  const { rows } = await payload.db.pool.query<Row>(
    `SELECT COUNT(*) AS plays, COALESCE(SUM(score), 0) AS score, COALESCE(SUM(total), 0) AS total FROM "${table}"${filter}`,
    typeof quizId === 'number' ? [quizId] : [],
  )

  const row = rows[0]
  if (!row) return EMPTY

  const plays = toNumber(row.plays)
  const score = toNumber(row.score)
  const total = toNumber(row.total)

  return {
    plays,
    score,
    total,
    // Aucune partie jouée, ou un barème à zéro : pas de division.
    successRate: total > 0 ? Math.round((score / total) * 100) : 0,
  }
}

/** Compteur global du site. */
export const getQuizStats = unstable_cache(
  async (): Promise<QuizStats> => readStats(),
  ['quiz-stats', 'all'],
  { revalidate: CACHE_TTL_SECONDS, tags: [QUIZ_STATS_TAG] },
)

/** Compteur d'un quiz. */
export const getQuizStatsFor = unstable_cache(
  async (quizId: number): Promise<QuizStats> => readStats(quizId),
  ['quiz-stats', 'by-quiz'],
  { revalidate: CACHE_TTL_SECONDS, tags: [QUIZ_STATS_TAG] },
)

/** Version non mise en cache, pour les tests et les scripts. */
export const computeQuizStats = readStats
