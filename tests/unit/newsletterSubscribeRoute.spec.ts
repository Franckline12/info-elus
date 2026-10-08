import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { SubscriptionAction } from '@/lib/newsletter/plan'

const requestSubscription = vi.fn(async (): Promise<SubscriptionAction> => 'create')

vi.mock('@/lib/newsletter/subscribers', () => ({ requestSubscription }))

const { POST } = await import('@/app/api/newsletter/subscribe/route')
const { SUBSCRIBE_SUCCESS } = await import('@/lib/newsletter/messages')

/**
 * Contrat public de la route : la réponse de succès ne doit rien laisser
 * deviner de l'état de l'adresse (§ 4.4), et le piège à robots doit rester
 * indiscernable d'une inscription réussie.
 */

let ip = 0

/** Une IP différente par requête : le limiteur de débit est partagé par le module. */
const post = (body: unknown, from = `203.0.113.${(ip += 1)}`) =>
  POST(
    new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': from },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  )

beforeEach(() => {
  requestSubscription.mockClear()
})

describe('POST /api/newsletter/subscribe', () => {
  it('accepte une adresse et délègue la décision au domaine', async () => {
    const response = await post({ email: 'Elu@CSE.fr' })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ message: SUBSCRIBE_SUCCESS })
    expect(requestSubscription).toHaveBeenCalledWith({ email: 'Elu@CSE.fr', source: undefined })
  })

  it('répond exactement la même chose dans les quatre situations', async () => {
    const bodies: string[] = []

    for (const action of ['create', 'renew', 'none', 'reactivate'] as const) {
      requestSubscription.mockResolvedValueOnce(action)
      const response = await post({ email: 'elu@cse.fr' })

      expect(response.status).toBe(200)
      bodies.push(await response.text())
    }

    expect(new Set(bodies).size).toBe(1)
  })

  it('transmet la page d’origine, tronquée', async () => {
    await post({ email: 'elu@cse.fr', source: 'x'.repeat(200) })

    expect(requestSubscription).toHaveBeenCalledWith({
      email: 'elu@cse.fr',
      source: 'x'.repeat(120),
    })
  })

  it('refuse une adresse mal formée sans rien écrire', async () => {
    const response = await post({ email: 'pas-une-adresse' })

    expect(response.status).toBe(400)
    expect(requestSubscription).not.toHaveBeenCalled()
  })

  it('refuse un corps qui n’est pas du JSON', async () => {
    const response = await post('<html>')

    expect(response.status).toBe(400)
    expect(requestSubscription).not.toHaveBeenCalled()
  })

  it('ignore silencieusement une requête qui remplit le champ piège', async () => {
    const response = await post({ email: 'robot@exemple.fr', website: 'http://spam.example' })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ message: SUBSCRIBE_SUCCESS })
    expect(requestSubscription).not.toHaveBeenCalled()
  })

  it('limite le débit d’une même IP', async () => {
    const from = '198.51.100.7'
    const statuses: number[] = []

    for (let attempt = 0; attempt < 7; attempt += 1) {
      statuses.push((await post({ email: `elu${attempt}@cse.fr` }, from)).status)
    }

    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200])
    expect(statuses.slice(5)).toEqual([429, 429])
  })

  it('renseigne Retry-After quand il refuse', async () => {
    const from = '198.51.100.9'
    for (let attempt = 0; attempt < 5; attempt += 1) await post({ email: 'elu@cse.fr' }, from)

    const response = await post({ email: 'elu@cse.fr' }, from)

    expect(response.status).toBe(429)
    expect(Number(response.headers.get('Retry-After'))).toBeGreaterThan(0)
  })
})
