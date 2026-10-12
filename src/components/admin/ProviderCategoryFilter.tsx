import type { ServerProps } from 'payload'

/**
 * Raccourcis de filtrage au-dessus de la liste des prestataires : l'équipe
 * éditoriale passe d'une catégorie à l'autre en un clic, sans ouvrir le
 * constructeur de filtres de Payload.
 *
 * Composant serveur : les catégories sont lues dans la taxonomie à chaque
 * affichage — une catégorie ajoutée dans l'admin apparaît donc ici aussitôt —
 * et ce sont de simples liens, l'état actif étant lu dans l'URL. `?page=1` seul
 * remet la liste à plat en effaçant le filtre.
 *
 * Le filtre porte sur l'identifiant et non sur le slug : c'est la forme que le
 * constructeur de filtres de Payload produit lui-même pour une relation, donc
 * celle que la liste sait relire.
 */

const WHERE_KEY = 'where[category][equals]'

const link = (active: boolean): React.CSSProperties => ({
  padding: '0.25rem 0.625rem',
  borderRadius: '3px',
  border: '1px solid var(--theme-elevation-150)',
  background: active ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-0)',
  color: active ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-800)',
  fontSize: '0.8125rem',
  textDecoration: 'none',
})

export const ProviderCategoryFilter = async ({ payload, searchParams }: ServerProps) => {
  const { docs: categories } = await payload.find({
    collection: 'provider-categories',
    sort: 'name',
    depth: 0,
    limit: 100,
    pagination: false,
  })

  // Tant qu'aucune catégorie n'est saisie, le bandeau n'aurait qu'un seul lien
  // sans effet : autant ne rien afficher.
  if (categories.length === 0) return null

  const current = searchParams?.[WHERE_KEY]
  const active = typeof current === 'string' ? current : undefined

  return (
    <nav
      aria-label="Filtrer par catégorie"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.5rem',
        margin: '0 0 1rem',
      }}
    >
      <a href="?page=1" style={link(!active)} aria-current={!active ? 'true' : undefined}>
        Toutes les catégories
      </a>

      {categories.map((category) => {
        const value = String(category.id)

        return (
          <a
            key={category.id}
            href={`?page=1&${WHERE_KEY}=${value}`}
            style={link(active === value)}
            aria-current={active === value ? 'true' : undefined}
          >
            {category.name}
          </a>
        )
      })}
    </nav>
  )
}

export default ProviderCategoryFilter
