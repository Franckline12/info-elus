/**
 * Lecture de la référence du quiz attendue par les deux routes de jeu. Les
 * helpers génériques (corps JSON, erreurs, 429) vivent dans `@/lib/api`, qui
 * sert aussi aux routes de la newsletter.
 */

export type QuizReference = {
  quizId?: number | string | null
  slug?: string | null
}

/** Référence du quiz acceptée par les deux routes : identifiant ou slug. */
export const readQuizReference = (body: Record<string, unknown>): QuizReference => ({
  quizId:
    typeof body.quizId === 'number' || typeof body.quizId === 'string' ? body.quizId : undefined,
  slug: typeof body.slug === 'string' ? body.slug : undefined,
})
