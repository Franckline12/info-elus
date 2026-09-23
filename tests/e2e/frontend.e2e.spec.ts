import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

test.describe('Socle visuel', () => {
  test('affiche le masthead et le titre de la page d’accueil', async ({ page }) => {
    await page.goto(BASE)

    await expect(page).toHaveTitle(/Infos Élus/)

    // Le H1 de l'accueil double le logotype du masthead pour les lecteurs
    // d'écran : il est dans le DOM mais hors affichage.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Infos Élus — Le média des élus du CSE',
    )

    await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeVisible()
  })

  test('la navigation est utilisable au clavier sous 900px', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 })
    await page.goto(BASE)

    const nav = page.getByRole('navigation', { name: 'Navigation principale' })
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

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Actualité')
  })

  test('une URL de contenu inconnue renvoie une 404 aux couleurs du site', async ({ page }) => {
    const response = await page.goto(`${BASE}/articles/slug-qui-nexiste-pas`)

    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cette page n’existe pas')
  })
})
