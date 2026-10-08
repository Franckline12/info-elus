import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://localhost:3000'

/**
 * Le parcours de jeu (§ 2.5) est la seule partie du site qui vit dans le
 * navigateur, et la seule dont la correction arrive par requête. Trois choses
 * ne se vérifient donc qu'ici, un navigateur réel à la main :
 * — la correction n'est pas dans la page avant que le joueur ait répondu ;
 * — enchaîner les questions mène bien à un score et à un récapitulatif ;
 * — la partie terminée est enregistrée, donc le compteur communautaire
 *   s'alimente pour de vrai.
 */
/**
 * Entre dans le quiz mis en avant, comme un visiteur. L'attente est large : en
 * développement, Next compile la page de jeu à la première visite.
 */
const openFeaturedQuiz = async (page: Page) => {
  await page.goto(`${BASE}/jeux-quiz`)
  await page.getByRole('link', { name: 'Jouer le quiz' }).click()
  await page.waitForURL(/\/jeux-quiz\/[^/]+$/, { timeout: 60_000 })
}

test.describe('Parcours de quiz', () => {
  /** Le libellé du bouton change sur la dernière question. */
  const advanceLabel = (question: number, count: number) =>
    question >= count ? 'Voir mon score' : 'Question suivante'

  test('se joue de bout en bout et enregistre la partie', async ({ page }) => {
    await page.goto(`${BASE}/jeux-quiz`)

    await openFeaturedQuiz(page)

    const progress = page.getByText(/^Question \d+ sur \d+$/)
    await expect(progress).toBeVisible()

    const count = Number(((await progress.textContent()) ?? '').match(/sur (\d+)/)?.[1])
    expect(count).toBeGreaterThan(0)

    // Rien dans la page ne désigne la bonne réponse : ni le drapeau du CMS, ni
    // la pastille que la correction fera apparaître ensuite.
    expect(await page.content()).not.toContain('isCorrect')
    await expect(page.getByLabel('Réponse correcte')).toHaveCount(0)

    for (let question = 1; question <= count; question += 1) {
      await expect(page.getByText(`Question ${question} sur ${count}`)).toBeVisible()

      const validate = page.getByRole('button', { name: 'Valider ma réponse' })
      await expect(validate).toBeDisabled()

      // La première option suffit : c'est le parcours qu'on teste, pas le savoir
      // du joueur — le score final dépendra de ce qu'elle vaut.
      await page.getByRole('radio').first().check()
      await expect(validate).toBeEnabled()
      await validate.click()

      // La correction vient de `/api/quiz/answer` : elle s'affiche après coup.
      await expect(page.getByLabel('Réponse correcte')).toBeVisible()

      const advance = page.getByRole('button', { name: advanceLabel(question, count) })
      await expect(advance).toBeVisible()
      await advance.click()
    }

    await expect(page.getByText('Score final')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Récapitulatif' })).toBeVisible()

    // Un score sur le barème du quiz, et autant de lignes que de questions.
    await expect(page.getByText(/^\d+ \/ \d+$/)).toBeVisible()
    await expect(page.getByRole('listitem').filter({ hasText: /^Question \d+ —/ })).toHaveCount(
      count,
    )

    // L'écriture en base est le bout de la chaîne : sans elle, le compteur
    // communautaire resterait à zéro. Si cette attente lâche, vérifier d'abord
    // la limitation de débit de `/api/quiz/result` : cinq enregistrements par
    // minute, et chacun des deux parcours de ce fichier en consomme un.
    await expect(
      page.getByText('Partie enregistrée : elle alimente le compteur communautaire.'),
    ).toBeVisible()
  })

  test('« Rejouer ce quiz » ramène à la première question', async ({ page }) => {
    await openFeaturedQuiz(page)

    const progress = page.getByText(/^Question \d+ sur \d+$/)
    const count = Number(((await progress.textContent()) ?? '').match(/sur (\d+)/)?.[1])

    for (let question = 1; question <= count; question += 1) {
      await page.getByRole('radio').first().check()
      await page.getByRole('button', { name: 'Valider ma réponse' }).click()
      await page.getByRole('button', { name: advanceLabel(question, count) }).click()
    }

    await page.getByRole('button', { name: 'Rejouer ce quiz' }).click()

    await expect(page.getByText(`Question 1 sur ${count}`)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Valider ma réponse' })).toBeDisabled()
    // Le récapitulatif de la partie précédente a disparu avec elle.
    await expect(page.getByRole('heading', { name: 'Récapitulatif' })).toHaveCount(0)
  })
})

test.describe('Historique des quiz', () => {
  test('met en avant le quiz de la semaine et pagine les précédents', async ({ page }) => {
    const response = await page.goto(`${BASE}/jeux-quiz`)

    expect(response?.status()).toBe(200)
    await expect(page.getByText('Quiz de la semaine')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Les quiz précédents' })).toBeVisible()

    // Le quiz mis en avant ne se répète pas dans l'historique en dessous.
    const featuredTitle = await page
      .locator('article')
      .first()
      .getByRole('heading')
      .first()
      .textContent()

    const historyTitles = await page
      .getByRole('heading', { level: 3 })
      .allTextContents()
      .then((titles) => titles.map((title) => title.trim()))

    expect(historyTitles).not.toContain((featuredTitle ?? '').trim())
  })

  test('une page d’historique au-delà du dernier quiz reste une page valide', async ({ page }) => {
    const response = await page.goto(`${BASE}/jeux-quiz?page=9999`)

    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jeux & Quiz')
    await expect(page.getByText('Cette page d’historique est vide')).toBeVisible()
    // Le quiz de la semaine n'appartient qu'à la première page.
    await expect(page.getByText('Quiz de la semaine')).toHaveCount(0)
  })
})
