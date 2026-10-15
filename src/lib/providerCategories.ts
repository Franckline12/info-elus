import type { Provider, ProviderCategory } from '@/payload-types'

/**
 * Catégories de l'annuaire (§ 2.4), désormais portées par la collection
 * `provider-categories` : l'équipe éditoriale les ajoute et les renomme depuis
 * l'admin, sans passer par le code.
 *
 * Le champ `category` d'une fiche vaut un identifiant quand la lecture est
 * faite à `depth: 0`, et le document complet au-delà. Il peut aussi être vide
 * si la catégorie a été supprimée après coup : la fiche reste en ligne, sans
 * badge ni lien de rubrique. Ce garde-fou couvre les deux cas.
 */
export const providerCategory = (
  value: Provider['category'] | null | undefined,
): ProviderCategory | null => (value && typeof value === 'object' ? value : null)
