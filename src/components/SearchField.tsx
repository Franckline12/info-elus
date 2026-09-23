import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import SearchIcon from '@mui/icons-material/Search'

type Props = {
  /** Page cible du formulaire : la recherche est un simple GET, sans JavaScript. */
  action: string
  name?: string
  label: string
  placeholder: string
  defaultValue?: string
  /** Champs conservés dans l'URL au moment de la soumission (filtre actif…). */
  hidden?: Record<string, string | undefined>
  fullWidth?: boolean
}

/**
 * Champ de recherche de la maquette (header, guides, prestataires). Rendu côté
 * serveur : chaque recherche a son URL, donc un état partageable et indexable.
 */
export function SearchField({
  action,
  name = 'q',
  label,
  placeholder,
  defaultValue,
  hidden,
  fullWidth = false,
}: Props) {
  return (
    <Box component="form" role="search" action={action} sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {Object.entries(hidden ?? {}).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null,
      )}

      {/* Le libellé n'est pas affiché — la maquette n'a qu'un texte d'aide —
          mais il reste porté par `aria-label` pour les lecteurs d'écran (§ 4.5). */}
      <TextField
        type="search"
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        size="small"
        fullWidth={fullWidth}
        slotProps={{
          htmlInput: { 'aria-label': label },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ width: '100%' }}
      />
    </Box>
  )
}

export default SearchField
