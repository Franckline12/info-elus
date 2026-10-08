import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export type TestUser = {
  email: string
  password: string
}

export const testUser: TestUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
}

/**
 * Seeds a test user for e2e admin tests.
 *
 * Pass a dedicated account when a spec runs alongside another admin spec: the
 * Playwright files run in parallel, and sharing one user means whichever spec
 * finishes first deletes the other's session.
 */
export async function seedTestUser(user: TestUser = testUser): Promise<void> {
  const payload = await getPayload({ config })

  // Delete existing test user if any
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: user.email,
      },
    },
  })

  // Create fresh test user
  await payload.create({
    collection: 'users',
    data: user,
  })
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(user: TestUser = testUser): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: user.email,
      },
    },
  })
}
