// Script to set isSubscribed=true on 'atelier-mandat' via Payload local API
// Run with: npx tsx src/scripts/setSubscribed.ts

import { getPayload } from 'payload'
import config from '../payload.config'

async function main() {
  const payload = await getPayload({ config })

  // Find the provider by slug
  const { docs } = await payload.find({
    collection: 'providers',
    where: { slug: { equals: 'atelier-mandat' } },
    limit: 1,
    depth: 0,
  })

  if (docs.length === 0) {
    console.error('Provider "atelier-mandat" not found. Have you run the seed?')
    process.exit(1)
  }

  const provider = docs[0]

  await payload.update({
    collection: 'providers',
    id: provider.id,
    data: { isSubscribed: true },
  })

  console.log(`✅ Provider "${provider.name}" (id: ${provider.id}) is now subscribed.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
