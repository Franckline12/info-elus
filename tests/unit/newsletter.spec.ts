import { describe, expect, it } from 'vitest'

import { EMAIL_MAX_LENGTH, isValidEmail, normalizeEmail } from '@/lib/newsletter/email'
import { planSubscription } from '@/lib/newsletter/plan'
import {
  TOKEN_TTL_MS,
  createToken,
  isTokenExpired,
  tokenExpiresAt,
  tokensMatch,
} from '@/lib/newsletter/tokens'

/**
 * Le double opt-in (§ 4.4) tient à trois choses : un jeton imprévisible et
 * daté, une adresse normalisée, et une réaction correcte à l'état déjà connu
 * de l'adresse. Ces trois points sont fixés ici.
 */

describe('normalizeEmail', () => {
  it('met en minuscules et retire les espaces autour', () => {
    expect(normalizeEmail('  Elu@CSE.FR ')).toBe('elu@cse.fr')
  })

  it('rend une adresse identique pour deux saisies équivalentes', () => {
    expect(normalizeEmail('Marie.Dupont@Exemple.fr')).toBe(
      normalizeEmail('marie.dupont@exemple.fr'),
    )
  })
})

describe('isValidEmail', () => {
  it.each(['elu@cse.fr', 'marie.dupont+news@exemple.co.uk', ' Secretaire@CSE-Nord.fr '])(
    'accepte %s',
    (value) => {
      expect(isValidEmail(value)).toBe(true)
    },
  )

  it.each(['', 'elu', 'elu@', '@cse.fr', 'elu@cse', 'elu cse@exemple.fr', 'a@b.fr, c@d.fr'])(
    'refuse %s',
    (value) => {
      expect(isValidEmail(value)).toBe(false)
    },
  )

  it('refuse ce qui n’est pas une chaîne', () => {
    expect(isValidEmail(undefined)).toBe(false)
    expect(isValidEmail(42)).toBe(false)
  })

  it('refuse une adresse plus longue que la limite', () => {
    expect(isValidEmail(`${'a'.repeat(EMAIL_MAX_LENGTH)}@exemple.fr`)).toBe(false)
  })
})

describe('createToken', () => {
  it('produit un jeton utilisable tel quel dans une URL', () => {
    const token = createToken()

    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(encodeURIComponent(token)).toBe(token)
  })

  it('a la longueur de 32 octets encodés en base64url', () => {
    expect(createToken()).toHaveLength(43)
  })

  it('ne se répète pas', () => {
    const tokens = new Set(Array.from({ length: 200 }, createToken))

    expect(tokens.size).toBe(200)
  })
})

describe('tokensMatch', () => {
  it('reconnaît deux jetons identiques', () => {
    const token = createToken()

    expect(tokensMatch(token, token)).toBe(true)
  })

  it('refuse deux jetons différents, même de même longueur', () => {
    expect(tokensMatch(createToken(), createToken())).toBe(false)
  })

  it('refuse un préfixe du bon jeton', () => {
    const token = createToken()

    expect(tokensMatch(token, token.slice(0, -1))).toBe(false)
  })

  it('refuse les valeurs absentes ou vides', () => {
    expect(tokensMatch(null, 'abc')).toBe(false)
    expect(tokensMatch('abc', undefined)).toBe(false)
    expect(tokensMatch('', '')).toBe(false)
  })
})

describe('expiration des jetons', () => {
  const now = new Date('2026-03-01T10:00:00.000Z')

  it('date la fin de validité à sept jours', () => {
    expect(Date.parse(tokenExpiresAt(now)) - now.getTime()).toBe(TOKEN_TTL_MS)
    expect(TOKEN_TTL_MS).toBe(7 * 24 * 60 * 60 * 1000)
  })

  it('reste valable la veille de l’échéance', () => {
    const expiresAt = tokenExpiresAt(now)
    const sixDaysLater = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000)

    expect(isTokenExpired(expiresAt, sixDaysLater)).toBe(false)
  })

  it('expire une fois l’échéance atteinte', () => {
    const expiresAt = tokenExpiresAt(now)
    const eightDaysLater = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000)

    expect(isTokenExpired(expiresAt, eightDaysLater)).toBe(true)
    expect(isTokenExpired(expiresAt, new Date(Date.parse(expiresAt)))).toBe(true)
  })

  it('traite comme expiré un jeton sans date lisible', () => {
    expect(isTokenExpired(null, now)).toBe(true)
    expect(isTokenExpired('', now)).toBe(true)
    expect(isTokenExpired('pas une date', now)).toBe(true)
  })
})

describe('planSubscription — les quatre cas du formulaire', () => {
  it('crée l’abonné et envoie l’email quand l’adresse est inconnue', () => {
    expect(planSubscription(null)).toEqual({ action: 'create', sendConfirmation: true })
  })

  it('régénère le jeton et renvoie l’email quand l’adresse est déjà en attente', () => {
    expect(planSubscription({ status: 'pending' })).toEqual({
      action: 'renew',
      sendConfirmation: true,
    })
  })

  it('n’envoie rien à une adresse déjà confirmée', () => {
    expect(planSubscription({ status: 'confirmed' })).toEqual({
      action: 'none',
      sendConfirmation: false,
    })
  })

  it('repasse un désinscrit en attente avec un nouvel email', () => {
    expect(planSubscription({ status: 'unsubscribed' })).toEqual({
      action: 'reactivate',
      sendConfirmation: true,
    })
  })
})
