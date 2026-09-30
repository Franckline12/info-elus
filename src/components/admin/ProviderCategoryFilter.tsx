import type { ServerProps } from 'payload'

import { providerCategoryOptions } from '@/lib/providerCategories'

/**
 * Raccourcis de filtrage au-dessus de la liste des prestataires : l'équipe
 * éditoriale passe d'une catégorie à l'autre en un clic, sans ouvrir le
 * constructeur de filtres de Payload.
 *
 * Composant serveur : ce sont de simples liens, l'état actif est lu dans
 * l'URL. `?page=1` seul remet la liste à plat en effaçant le filtre.
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

export const ProviderCategoryFilter = ({ searchParams }: ServerProps) => {
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

      {providerCategoryOptions.map((option) => (
        <a
          key={option.value}
          href={`?page=1&${WHERE_KEY}=${option.value}`}
          style={link(active === option.value)}
          aria-current={active === option.value ? 'true' : undefined}
        >
          {option.label}
        </a>
      ))}
    </nav>
  )
}

export default ProviderCategoryFilter
