import { test, expect, type Page } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config.js'
import { login } from '../helpers/login'
import { cleanupTestUser, seedTestUser, type TestUser } from '../helpers/seedUser'

const BASE = 'http://localhost:3000'
const SUFFIX = 'e2e-grand-format'

/**
 * Compte propre à ce spec : les fichiers Playwright tournent en parallèle, et
 * partager l'utilisateur de `admin.e2e.spec.ts` ferait supprimer sa session par
 * le premier `afterAll` qui s'exécute.
 */
const redacteur: TestUser = { email: 'e2e-actualite@infos-elus.test', password: 'test' }

/**
 * Règle métier du back-office : une seule actualité peut porter le « Grand
 * format » (§ 2.3). La cocher depuis l'admin doit la décocher partout ailleurs,
 * et le fil public doit ouvrir sur elle.
 */
test.describe('Back-office : grand format de l’actualité', () => {
  let payload: Payload
  /** Session admin partagée par les deux tests, comme dans `admin.e2e.spec.ts`. */
  let page: Page
  let ancienneId: number
  let nouvelleId: number
  /** Actualité du jeu de démonstration à remettre en avant après le test. */
  let aRestaurer: number | null = null

  const body = {
    root: {
      type: 'root',
      version: 1,
      format: '',
      indent: 0,
      direction: 'ltr',
      children: [
        {
          type: 'paragraph',
          version: 1,
          format: '',
          indent: 0,
          direction: 'ltr',
          textFormat: 0,
          children: [
            {
              type: 'text',
              version: 1,
              text: 'Corps de test.',
              format: 0,
              style: '',
              mode: 'normal',
              detail: 0,
            },
          ],
        },
      ],
    },
  } as never

  test.beforeAll(async ({ browser }) => {
    payload = await getPayload({ config })
    await seedTestUser(redacteur)

    // Mémorisé avant toute écriture : créer une actualité en grand format
    // décocherait celle du seed, et le test doit rendre la base intacte.
    const { docs: dejaEnAvant } = await payload.find({
      collection: 'articles',
      where: { featuredInNews: { equals: true } },
      limit: 1,
      depth: 0,
    })
    aRestaurer = dejaEnAvant[0]?.id ?? null

    const { docs: categories } = await payload.find({ collection: 'categories', limit: 1 })
    const categoryId = categories[0].id

    const creer = async (titre: string, slug: string, grandFormat: boolean) => {
      const doc = await payload.create({
        collection: 'articles',
        context: { disableRevalidate: true },
        data: {
          title: titre,
          slug,
          excerpt: 'Chapô de test.',
          content: body,
          category: categoryId,
          type: 'news',
          featuredInNews: grandFormat,
          _status: 'published',
          publishedAt: '2026-10-07T08:00:00.000Z',
        },
      })
      return doc.id
    }

    ancienneId = await creer('Ancien grand format', `ancien-${SUFFIX}`, true)
    nouvelleId = await creer('Nouveau grand format', `nouveau-${SUFFIX}`, false)

    const context = await browser.newContext()
    page = await context.newPage()
    await login({ page, user: redacteur })
  })

  test.afterAll(async () => {
    await payload.delete({
      collection: 'articles',
      where: { id: { in: [ancienneId, nouvelleId] } },
      context: { disableRevalidate: true },
    })

    if (aRestaurer !== null) {
      await payload.update({
        collection: 'articles',
        id: aRestaurer,
        data: { featuredInNews: true, _status: 'published' },
        context: { disableRevalidate: true },
      })
    }

    await cleanupTestUser(redacteur)
  })

  test('cocher « Grand format » décoche l’actualité précédente', async () => {
    await page.goto(`${BASE}/admin/collections/articles/${nouvelleId}`)

    const grandFormat = page.getByLabel('Grand format (actualité)')
    await expect(grandFormat).not.toBeChecked()

    await grandFormat.check()
    await page
      .getByRole('button', { name: /Publier les modifications|Publier/ })
      .first()
      .click()

    // L'admin confirme l'enregistrement avant que le hook ait fini sa cascade :
    // on attend la notification plutôt qu'un délai arbitraire.
    await expect(page.getByText(/mis à jour|Mise à jour/i).first()).toBeVisible()

    await expect
      .poll(async () => {
        const doc = await payload.findByID({
          collection: 'articles',
          id: ancienneId,
          depth: 0,
        })
        return doc.featuredInNews
      })
      .toBe(false)

    const nouvelle = await payload.findByID({ collection: 'articles', id: nouvelleId, depth: 0 })
    expect(nouvelle.featuredInNews).toBe(true)
    // Décocher ne doit jamais dépublier l'actualité évincée.
    const ancienne = await payload.findByID({ collection: 'articles', id: ancienneId, depth: 0 })
    expect(ancienne._status).toBe('published')
  })

  test('le fil public ouvre sur la nouvelle actualité en grand format', async () => {
    await page.goto(`${BASE}/actualite`)

    const uneALaUne = page.getByRole('region', { name: 'À la une de l’actualité' })

    await expect(uneALaUne.getByRole('heading', { level: 2 })).toHaveText('Nouveau grand format')
    await expect(uneALaUne).toContainText('À la une')
  })
})
