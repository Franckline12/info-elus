import type { PaginatedDocs, Where } from 'payload'

import type { FilterOption } from '@/lib/filterOptions'
import {
  NATIONWIDE_AREA,
  interventionAreaOptions,
  matchingAreas,
} from '@/lib/interventionAreas'
import { providerCategoryOptions } from '@/lib/providerCategories'
import type { Provider } from '@/payload-types'

import { getPayloadClient } from './payload'

/**
 * Lectures publiques de l'annuaire des prestataires (§ 2.4).
 *
 * L'annuaire n'a pas de brouillons : une fiche est en ligne quand l'équipe a
 * coché « Visible sur le site ». Le filtre est donc posé explicitement sur
 * chaque lecture publique, même si l'access control l'appliquerait déjà.
 */

const PUBLISHED: Where = { published: { equals: true } }

/**
 * Clauses communes à toutes les lectures filtrées. Filtrer sur une région
 * remonte aussi les prestataires déclarés « France entière » : ils y
 * interviennent, les masquer viderait l'annuaire sans raison.
 */
const filters = ({
  categorySlug,
  area,
  excludeIds,
}: {
  categorySlug?: string
  area?: string
  excludeIds?: number[]
}): Where[] => [
  ...(categorySlug ? [{ category: { equals: categorySlug } } satisfies Where] : []),
  ...(area ? [{ interventionAreas: { in: matchingAreas(area) } } satisfies Where] : []),
  ...(excludeIds && excludeIds.length > 0 ? [{ id: { not_in: excludeIds } } satisfies Where] : []),
]

export type GetProvidersArgs = {
  categorySlug?: string
  area?: string
  page?: number
  limit?: number
  excludeIds?: number[]
}

/** Annuaire paginé, classé par ordre alphabétique. */
export async function getProviders({
  categorySlug,
  area,
  page = 1,
  limit = 12,
  excludeIds,
}: GetProvidersArgs = {}): Promise<PaginatedDocs<Provider>> {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'providers',
    where: { and: [PUBLISHED, ...filters({ categorySlug, area, excludeIds })] },
    sort: 'name',
    depth: 1,
    page,
    limit,
  })
}

/** Prestataires abonnés (mis en avant en grand format en tête de l'annuaire). */
export async function getSubscribedProviders({
  categorySlug,
  area,
  limit = 6,
}: { categorySlug?: string; area?: string; limit?: number } = {}): Promise<Provider[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'providers',
    where: {
      and: [
        PUBLISHED,
        { isSubscribed: { equals: true } },
        ...filters({ categorySlug, area }),
      ],
    },
    sort: 'name',
    depth: 1,
    limit,
  })

  return docs
}

export async function getProviderBySlug(slug: string): Promise<Provider | null> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'providers',
    where: { and: [PUBLISHED, { slug: { equals: slug } }] },
    depth: 1,
    limit: 1,
  })

  return docs[0] ?? null
}

/**
 * Catégories du filtre, avec leur nombre de fiches visibles. Les catégories
 * vides sont écartées : proposer un filtre qui ne renvoie rien n'aide personne.
 *
 * Le décompte tient compte de la zone active, mais jamais de la catégorie
 * active : chaque option annonce ce qu'elle donnerait si on la choisissait.
 */
export async function getCategoriesWithCount({
  area,
}: { area?: string } = {}): Promise<FilterOption[]> {
  const payload = await getPayloadClient()

  const base = [PUBLISHED, ...filters({ area })]

  const counts = await Promise.all(
    providerCategoryOptions.map((option) =>
      payload.count({
        collection: 'providers',
        where: { and: [...base, { category: { equals: option.value } }] },
      }),
    ),
  )

  return providerCategoryOptions.flatMap((option, index) =>
    counts[index].totalDocs > 0
      ? [{ value: option.value, label: option.label, count: counts[index].totalDocs }]
      : [],
  )
}

/**
 * Zones du filtre, avec leur nombre de fiches visibles.
 *
 * Seules les zones effectivement déclarées par un prestataire sont proposées :
 * sans cela, les dix-huit régions apparaîtraient dès qu'une fiche couvre la
 * France entière. Le décompte, lui, suit la règle du filtre et inclut donc les
 * prestataires nationaux.
 *
 * Une seule lecture plutôt que dix-neuf `count` : l'annuaire reste de taille
 * modeste, et le calcul en mémoire évite d'interroger la base par option.
 */
export async function getAreasWithCount({
  categorySlug,
}: { categorySlug?: string } = {}): Promise<FilterOption[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'providers',
    where: { and: [PUBLISHED, ...filters({ categorySlug })] },
    depth: 0,
    limit: 1000,
    pagination: false,
    select: { interventionAreas: true },
  })

  const declared = docs.map((doc) => doc.interventionAreas ?? [])
  const nationwide = declared.filter((areas) => areas.includes(NATIONWIDE_AREA)).length

  return interventionAreaOptions.flatMap((option) => {
    if (!declared.some((areas) => areas.includes(option.value))) return []

    const count =
      option.value === NATIONWIDE_AREA
        ? nationwide
        : declared.filter(
            (areas) => areas.includes(option.value) || areas.includes(NATIONWIDE_AREA),
          ).length

    return [{ value: option.value, label: option.label, count }]
  })
}

/** Slugs des fiches en ligne, pour `generateStaticParams`. */
export async function getPublishedProviderSlugs(): Promise<string[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'providers',
    where: PUBLISHED,
    depth: 0,
    limit: 1000,
    pagination: false,
    select: { slug: true },
  })

  return docs.map((doc) => doc.slug).filter((slug): slug is string => Boolean(slug))
}
