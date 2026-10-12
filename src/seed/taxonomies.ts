import type { Payload } from 'payload'

import type { Theme } from '../payload-types'

export type SeedTheme = {
  slug: string
  name: string
  color: Theme['color']
}

export type SeedTaxonomy = {
  slug: string
  name: string
}

/**
 * Catégories d'articles et d'actualité (§ 2.1). Partagées par les deux types de
 * la collection Articles : un article de fond et une actualité se classent dans
 * la même taxonomie.
 */
export const CATEGORIES: SeedTaxonomy[] = [
  { slug: 'negociation', name: 'Négociation' },
  { slug: 'sante-securite-au-travail', name: 'Santé & sécurité au travail' },
  { slug: 'budget', name: 'Budget' },
  { slug: 'elections', name: 'Élections' },
]

/**
 * Catégories de l'annuaire des prestataires (§ 2.4). Taxonomie distincte de
 * `CATEGORIES` : on classe ici un métier, pas un sujet.
 */
export const PROVIDER_CATEGORIES: SeedTaxonomy[] = [
  { slug: 'formation', name: 'Formation' },
  { slug: 'assistance-juridique', name: 'Assistance juridique' },
  { slug: 'comptabilite-audit', name: 'Comptabilité & audit' },
  { slug: 'billetterie-asc', name: 'Billetterie & ASC' },
  { slug: 'evenementiel', name: 'Événementiel' },
  { slug: 'assurance-prevoyance', name: 'Assurance & prévoyance' },
  { slug: 'communication-edition', name: 'Communication & édition' },
  { slug: 'outils-de-gestion', name: 'Outils de gestion' },
]

/** Tags transverses aux articles, à l'actualité et aux guides (§ 2.3, § 4.2). */
export const TAGS: SeedTaxonomy[] = [
  { slug: 'mandat', name: 'Mandat' },
  { slug: 'budget', name: 'Budget' },
  { slug: 'prevention', name: 'Prévention' },
  { slug: 'procedure', name: 'Procédure' },
]

/**
 * Crée les thèmes manquants et renvoie la correspondance slug → identifiant.
 *
 * Partagé par les seeds de guides et de quiz : les deux rubriques s'appuient
 * sur la même taxonomie, et le script doit rester rejouable.
 */
export const ensureThemes = async (
  payload: Payload,
  themes: SeedTheme[],
): Promise<Map<string, number>> => {
  const map = new Map<string, number>()

  for (const theme of themes) {
    const { docs } = await payload.find({
      collection: 'themes',
      where: { slug: { equals: theme.slug } },
      limit: 1,
      depth: 0,
    })

    const existing = docs[0]
    if (existing) {
      map.set(theme.slug, existing.id)
      continue
    }

    const created = await payload.create({
      collection: 'themes',
      data: { name: theme.name, slug: theme.slug, color: theme.color },
    })
    payload.logger.info(`Thème créé : ${theme.name}`)
    map.set(theme.slug, created.id)
  }

  return map
}

/**
 * Crée les catégories manquantes et renvoie la correspondance slug → identifiant.
 *
 * Les catégories déjà saisies dans l'admin sont réutilisées telles quelles : le
 * seed ne renomme ni ne remplace une taxonomie qu'un rédacteur a pu enrichir.
 */
export const ensureCategories = async (
  payload: Payload,
  categories: SeedTaxonomy[] = CATEGORIES,
): Promise<Map<string, number>> => {
  const map = new Map<string, number>()

  for (const category of categories) {
    const { docs } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: category.slug } },
      limit: 1,
      depth: 0,
    })

    const existing = docs[0]
    if (existing) {
      map.set(category.slug, existing.id)
      continue
    }

    const created = await payload.create({
      collection: 'categories',
      data: { name: category.name, slug: category.slug },
    })
    payload.logger.info(`Catégorie créée : ${category.name}`)
    map.set(category.slug, created.id)
  }

  return map
}

/** Même contrat que `ensureCategories`, pour les catégories de prestataires. */
export const ensureProviderCategories = async (
  payload: Payload,
  categories: SeedTaxonomy[] = PROVIDER_CATEGORIES,
): Promise<Map<string, number>> => {
  const map = new Map<string, number>()

  for (const category of categories) {
    const { docs } = await payload.find({
      collection: 'provider-categories',
      where: { slug: { equals: category.slug } },
      limit: 1,
      depth: 0,
    })

    const existing = docs[0]
    if (existing) {
      map.set(category.slug, existing.id)
      continue
    }

    const created = await payload.create({
      collection: 'provider-categories',
      data: { name: category.name, slug: category.slug },
    })
    payload.logger.info(`Catégorie de prestataire créée : ${category.name}`)
    map.set(category.slug, created.id)
  }

  return map
}

/** Même contrat que `ensureCategories`, pour les tags. */
export const ensureTags = async (
  payload: Payload,
  tags: SeedTaxonomy[] = TAGS,
): Promise<Map<string, number>> => {
  const map = new Map<string, number>()

  for (const tag of tags) {
    const { docs } = await payload.find({
      collection: 'tags',
      where: { slug: { equals: tag.slug } },
      limit: 1,
      depth: 0,
    })

    const existing = docs[0]
    if (existing) {
      map.set(tag.slug, existing.id)
      continue
    }

    const created = await payload.create({
      collection: 'tags',
      data: { name: tag.name, slug: tag.slug },
    })
    map.set(tag.slug, created.id)
  }

  return map
}
