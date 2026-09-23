import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

test.describe('Socle visuel', () => {
  test('affiche le masthead et un titre unique sur la page d’accueil', async ({ page }) => {
    await page.goto(BASE)

    await expect(page).toHaveTitle(/Infos Élus/)

    // Le H1 de l'accueil est le titre de l'article d'ouverture ; sans contenu
    // publié, c'est le logotype repris hors affichage pour les lecteurs d'écran.
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)

    await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Grandes sections du site' })).toBeVisible()
  })

  test('la navigation est utilisable au clavier sous 900px', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 })
    await page.goto(BASE)

    const nav = page.getByRole('navigation', { name: 'Navigation principale (mobile)' })
    const navLink = nav.getByRole('link', { name: 'Actualité' })
    const toggle = page.getByRole('button', { name: 'Menu' })

    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(navLink).toBeHidden()

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(navLink).toBeVisible()

    // Échap referme l'accordéon et rend le focus au bouton.
    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(navLink).toBeHidden()
    await expect(toggle).toBeFocused()
  })
})

test.describe('Articles et actualité', () => {
  test('le listing des articles répond et porte son titre', async ({ page }) => {
    await page.goto(`${BASE}/articles`)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Articles')
    await expect(page.getByRole('navigation', { name: 'Filtrer par catégorie' })).toBeVisible()
  })

  test('le listing de l’actualité répond et porte son titre', async ({ page }) => {
    await page.goto(`${BASE}/actualite`)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Toute l’actualité CSE')
  })

  test('les rubriques guides, quiz, prestataires et recherche répondent', async ({ page }) => {
    const pages = [
      { path: '/guides', heading: 'Guides CSE' },
      { path: '/jeux-quiz', heading: 'Jeux & Quiz' },
      { path: '/prestataires', heading: 'Annuaire des prestataires' },
      { path: '/recherche', heading: 'Rechercher' },
    ]

    for (const { path, heading } of pages) {
      const response = await page.goto(`${BASE}${path}`)

      expect(response?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
    }
  })

  test('la recherche globale renvoie une page de résultats partageable', async ({ page }) => {
    await page.goto(`${BASE}/recherche`)

    await page.getByRole('searchbox', { name: 'Votre recherche' }).fill('budget')
    await page.keyboard.press('Enter')

    await expect(page).toHaveURL(/\/recherche\?q=budget/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rechercher')
  })

  test('une URL de contenu inconnue renvoie une 404 aux couleurs du site', async ({ page }) => {
    const response = await page.goto(`${BASE}/articles/slug-qui-nexiste-pas`)

    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cette page n’existe pas')
  })
})
