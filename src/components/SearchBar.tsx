'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SearchIcon from '@mui/icons-material/Search'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import type { FormEvent, MouseEvent } from 'react'

import AppLink from '@/components/AppLink'
import type { FilterOption } from '@/lib/filterOptions'
import { colors, hoverShadow, radius, surfaceBorder } from '@/theme/tokens'

/** Un filtre rendu en menu déroulant : une option = une URL. */
export type SearchFilter = {
  /** Nom du paramètre d'URL (`categorie`, `theme`…). */
  name: string
  /** Libellé accessible du menu (jamais affiché). */
  label: string
  /** Première option, valeur vide : « Toutes les catégories »… */
  allLabel: string
  /** Total annoncé par cette première option. */
  allCount?: number
  value?: string
  options: FilterOption[]
}

type Props = {
  /** Page cible du formulaire : la recherche reste un GET, sans JavaScript. */
  action: string
  name?: string
  label: string
  placeholder: string
  defaultValue?: string
  /** Filtres rendus en menus, appliqués dès le clic sur une option. */
  filters?: SearchFilter[]
  /** Champs conservés dans l'URL au moment de la soumission (tag actif…). */
  hidden?: Record<string, string | undefined>
  /** Décompte affiché en bout de rangée : « 5 guides ». */
  resultLabel?: string
  submitLabel?: string
}

const FIELD_PADDING_Y = 1.5

/** Le champ ne s'étire pas : au-delà, une ligne de saisie vide paraît creuse. */
const FIELD_MAX_WIDTH = 460

/** Délai avant de lancer la recherche : assez court pour paraître immédiat, assez
 *  long pour ne pas pousser une URL à chaque frappe. */
const DEBOUNCE_MS = 350

/**
 * Barre de recherche des listings (articles, guides, prestataires) : le terme et
 * les filtres vivent dans l'URL, donc chaque état reste partageable et indexable.
 *
 * Champ et filtre sont deux surfaces distinctes, séparées par un vrai blanc :
 * le filtre n'est pas un appendice du champ. La rangée ne s'étire pas sur toute
 * la largeur — elle se cale à gauche, le décompte à droite, comme une ligne de
 * sommaire de journal.
 *
 * La recherche part toute seule — à la frappe après une courte pause, et au clic
 * sur une option de filtre. Les options sont de vrais liens dans un `<details>` :
 * le menu s'ouvre et le filtre s'applique même sans JavaScript, et les listings
 * filtrés restent explorables par les moteurs. Le bouton d'envoi n'apparaît que
 * dans ce cas de repli (`<noscript>`), où la frappe ne déclenche plus rien.
 */
export function SearchBar({
  action,
  name = 'q',
  label,
  placeholder,
  defaultValue,
  filters = [],
  hidden,
  resultLabel,
  submitLabel = 'Rechercher',
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [term, setTerm] = useState(defaultValue ?? '')
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(filters.map((filter) => [filter.name, filter.value ?? ''])),
  )
  /** Un seul menu ouvert à la fois. */
  const [openFilter, setOpenFilter] = useState<string | null>(null)

  const buildUrl = (nextTerm: string, nextValues: Record<string, string>): string => {
    const params = new URLSearchParams()
    Object.entries(hidden ?? {}).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    Object.entries(nextValues).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    const trimmed = nextTerm.trim()
    if (trimmed) params.set(name, trimmed)
    const query = params.toString()
    // `page` est volontairement absent : changer de recherche ramène en page 1.
    return query ? `${action}?${query}` : action
  }

  // Retour arrière du navigateur : l'URL redevient la source de vérité. Les
  // effets ne se déclenchent que si la prop a réellement changé, donc jamais
  // pendant la frappe — la valeur poussée revient identique à l'état local.
  const termProp = useRef(defaultValue)
  useEffect(() => {
    if (termProp.current !== defaultValue) {
      termProp.current = defaultValue
      setTerm(defaultValue ?? '')
    }
  }, [defaultValue])

  const filterProps = useRef(filters.map((filter) => filter.value))
  useEffect(() => {
    const incoming = filters.map((filter) => filter.value)
    if (incoming.some((value, index) => value !== filterProps.current[index])) {
      filterProps.current = incoming
      setValues(Object.fromEntries(filters.map((filter) => [filter.name, filter.value ?? ''])))
    }
  }, [filters])

  // Recherche à la frappe. Le minuteur est gardé en référence pour qu'un clic
  // sur une option puisse l'annuler : le lien navigue déjà, une poussée
  // différée en doublon ajouterait une entrée d'historique fantôme.
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Les filtres courants sont relus au déclenchement du minuteur, sans figurer
  // dans les dépendances de l'effet : les y mettre relancerait le délai à
  // chaque changement de filtre. La synchronisation passe par un effet — écrire
  // une référence pendant le rendu n'est pas permis — déclaré avant celui du
  // minuteur, donc appliqué en premier à chaque rendu.
  const values_ = useRef(values)
  useEffect(() => {
    values_.current = values
  }, [values])

  useEffect(() => {
    // Rien à pousser si l'URL porte déjà ce terme : c'est le cas au montage et
    // juste après une navigation.
    if ((defaultValue ?? '') === term) return
    timer.current = setTimeout(() => {
      startTransition(() => router.push(buildUrl(term, values_.current), { scroll: false }))
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term])

  // Fermeture du menu au clic extérieur et à la touche Échap.
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!openFilter) return
    const onPointerDown = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) setOpenFilter(null)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenFilter(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openFilter])

  const handleOptionClick = (filterName: string, value: string) => {
    clearTimeout(timer.current)
    setValues({ ...values, [filterName]: value })
    setOpenFilter(null)
  }

  // Entrée : on court-circuite le délai plutôt que de recharger la page.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearTimeout(timer.current)
    startTransition(() => router.push(buildUrl(term, values), { scroll: false }))
  }

  /** Champ et filtre partagent le même traitement de surface : même papier,
   *  même filet, même accent ocre au focus — jamais de bleu, qui ferait
   *  ressembler la barre à un formulaire d'application. */
  const surface = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: `1px solid ${surfaceBorder}`,
    borderRadius: `${radius}px`,
    transition: 'border-color 160ms ease, box-shadow 160ms ease',
    '&:focus-within': {
      borderColor: colors.accentQuiz,
      boxShadow: `0 0 0 3px ${colors.sandPale}`,
    },
  }

  return (
    <Box
      component="form"
      role="search"
      action={action}
      onSubmit={handleSubmit}
      aria-busy={isPending}
      sx={{ width: '100%' }}
    >
      {Object.entries(hidden ?? {}).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null,
      )}
      {/* Sans JavaScript, le filtre choisi par lien doit survivre à l'envoi du
          formulaire : il voyage dans un champ caché. */}
      {filters.map((filter) => (
        <input
          key={filter.name}
          type="hidden"
          name={filter.name}
          value={values[filter.name] ?? ''}
        />
      ))}

      <Box
        ref={barRef}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: { xs: 1.5, md: 2 },
        }}
      >
        {/* Le libellé n'est pas affiché — la maquette n'a qu'un texte d'aide —
            mais il reste porté par `aria-label` pour les lecteurs d'écran (§ 4.5). */}
        <Box
          sx={{
            ...surface,
            gap: 1.25,
            flex: 1,
            minWidth: 0,
            maxWidth: { md: FIELD_MAX_WIDTH },
            px: 2,
            py: FIELD_PADDING_Y,
          }}
        >
          {/* La loupe cède la place au témoin de chargement : même encombrement,
              donc aucun décalage pendant la recherche. */}
          <Box
            aria-hidden
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              flexShrink: 0,
              color: 'text.secondary',
            }}
          >
            {isPending ? (
              <CircularProgress size={16} thickness={5} sx={{ color: colors.textSecondary }} />
            ) : (
              <SearchIcon fontSize="small" />
            )}
          </Box>
          <InputBase
            type="search"
            name={name}
            placeholder={placeholder}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            inputProps={{ 'aria-label': label }}
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: '0.9375rem',
              // Le champ n'a pas de contour : l'anneau de la surface en tient lieu.
              '& input::-webkit-search-cancel-button': { cursor: 'pointer' },
            }}
          />
        </Box>

        {filters.map((filter) => {
          const current = values[filter.name] ?? ''
          const open = openFilter === filter.name
          const active = filter.options.find((option) => option.value === current)
          const rows: (FilterOption & { href: string })[] = [
            {
              value: '',
              label: filter.allLabel,
              count: filter.allCount,
              href: buildUrl(term, { ...values, [filter.name]: '' }),
            },
            ...filter.options.map((option) => ({
              ...option,
              href: buildUrl(term, { ...values, [filter.name]: option.value }),
            })),
          ]

          return (
            <Box
              key={filter.name}
              sx={{ ...surface, position: 'relative', flexShrink: 0, minWidth: { md: 236 } }}
            >
              <Box component="details" open={open} sx={{ width: '100%' }}>
                <Box
                  component="summary"
                  aria-expanded={open}
                  aria-label={filter.label}
                  // Le clic est repris par React pour piloter l'ouverture ; sans
                  // JavaScript, `details` bascule tout seul.
                  onClick={(event: MouseEvent) => {
                    event.preventDefault()
                    setOpenFilter(open ? null : filter.name)
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    px: 2,
                    py: FIELD_PADDING_Y,
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    listStyle: 'none',
                    userSelect: 'none',
                    // Un filtre actif se signale par la couleur, comme un lien suivi.
                    color: current ? colors.blueMid : colors.ink,
                    '&::-webkit-details-marker': { display: 'none' },
                    '&:focus-visible': {
                      outline: `2px solid ${colors.ink}`,
                      outlineOffset: '-2px',
                      borderRadius: `${radius}px`,
                    },
                  }}
                >
                  <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {active?.label ?? filter.allLabel}
                  </Box>
                  <KeyboardArrowDownIcon
                    fontSize="small"
                    aria-hidden
                    sx={{
                      flexShrink: 0,
                      color: 'text.secondary',
                      transition: 'transform 160ms ease',
                      transform: open ? 'rotate(180deg)' : 'none',
                    }}
                  />
                </Box>

                <Box
                  component="ul"
                  sx={{
                    position: 'absolute',
                    zIndex: 5,
                    top: 'calc(100% + 6px)',
                    left: -1,
                    right: -1,
                    minWidth: { md: 268 },
                    m: 0,
                    py: 0.75,
                    listStyle: 'none',
                    backgroundColor: colors.paperRaised,
                    border: `1px solid ${surfaceBorder}`,
                    borderRadius: `${radius}px`,
                    // Le menu flotte au-dessus du contenu : une ombre neutre le
                    // décolle, faute de quoi il se confond avec les cartes.
                    boxShadow: `0 10px 28px ${hoverShadow}`,
                  }}
                >
                  {rows.map((row) => {
                    const selected = row.value === current

                    return (
                      <Box component="li" key={row.value || 'all'} sx={{ px: 0.75 }}>
                        <AppLink
                          href={row.href}
                          underline="none"
                          scroll={false}
                          aria-current={selected ? 'true' : undefined}
                          onClick={() => handleOptionClick(filter.name, row.value)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1.5,
                            px: 1.5,
                            py: 1.25,
                            borderRadius: `${radius}px`,
                            fontSize: '0.9375rem',
                            fontWeight: 500,
                            color: selected ? colors.blueMid : colors.ink,
                            backgroundColor: selected ? colors.bluePale : 'transparent',
                            transition: 'background-color 120ms ease',
                            '&:hover': {
                              backgroundColor: selected ? colors.bluePale : colors.paper,
                            },
                          }}
                        >
                          <Box component="span">{row.label}</Box>
                          {typeof row.count === 'number' ? (
                            <Box
                              component="span"
                              sx={{
                                flexShrink: 0,
                                minWidth: 26,
                                px: 0.75,
                                py: 0.125,
                                borderRadius: `${radius}px`,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textAlign: 'center',
                                backgroundColor: selected ? colors.blueBright : colors.paper,
                                color: selected ? '#FFFFFF' : colors.textSecondary,
                              }}
                            >
                              {row.count}
                            </Box>
                          ) : null}
                        </AppLink>
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            </Box>
          )
        })}

        {/* Bout de rangée : le décompte, aligné à droite comme un folio. */}
        {resultLabel ? (
          <Typography
            component="p"
            aria-live="polite"
            sx={{
              m: 0,
              ml: { md: 'auto' },
              pl: { md: 1 },
              flexShrink: 0,
              fontSize: '0.875rem',
              color: 'text.secondary',
              opacity: isPending ? 0.5 : 1,
              transition: 'opacity 160ms ease',
            }}
          >
            {resultLabel}
          </Typography>
        ) : null}

        {/* Sans JavaScript, la recherche redevient un envoi manuel : le bouton
            n'apparaît que dans ce cas, sinon il ferait double emploi. */}
        <noscript>
          <Button
            type="submit"
            color="accentQuiz"
            variant="contained"
            sx={{ px: 3, py: 1.375, fontWeight: 600, color: colors.ink, whiteSpace: 'nowrap' }}
          >
            {submitLabel}
          </Button>
        </noscript>
      </Box>
    </Box>
  )
}

export default SearchBar
