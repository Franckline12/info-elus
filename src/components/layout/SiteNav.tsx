'use client'

/**
 * Barre de navigation du masthead : elle porte la frontière `'use client'` parce
 * qu'elle a besoin du chemin courant (lien actif) et d'un état local
 * (accordéon sous 900px, § 4.1). Le logotype lui est transmis en `children`
 * depuis le composant serveur `Header`, ce qui évite de dupliquer la barre.
 */

import { useCallback, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import MenuIcon from '@mui/icons-material/Menu'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import SearchIcon from '@mui/icons-material/Search'
import { usePathname } from 'next/navigation'

import AppLink from '@/components/AppLink'
import SectionGlyph from '@/components/SectionGlyph'
import type { NavItem } from '@/lib/site'
import { searchPath } from '@/lib/routes'
import { colors, rule } from '@/theme/tokens'

const NAV_ID = 'site-nav'

const isActive = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`)

type Props = {
  items: NavItem[]
  /** Logotype rendu côté serveur, placé à gauche de la barre. */
  children: ReactNode
}

export function SiteNav({ items, children }: Props) {
  const pathname = usePathname() ?? '/'
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // Échap referme l'accordéon et rend le focus au bouton, pour ne pas laisser
  // l'utilisateur clavier bloqué dans un menu invisible.
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return
    setOpen((wasOpen) => {
      if (wasOpen) toggleRef.current?.focus()
      return false
    })
  }, [])

  return (
    <Box onKeyDown={handleKeyDown}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, md: 2 },
          minHeight: { xs: 60, md: 72 },
        }}
      >
        {children}

        <Box
          component="nav"
          aria-label="Navigation principale"
          sx={{ display: { xs: 'none', md: 'block' }, ml: 'auto' }}
        >
          <Box
            component="ul"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { md: 2.5, lg: 3.5 },
              listStyle: 'none',
              m: 0,
              p: 0,
            }}
          >
            {items.map((item) => {
              const active = isActive(pathname, item.href)

              return (
                <li key={item.href}>
                  <AppLink
                    href={item.href}
                    underline="none"
                    aria-current={active ? 'page' : undefined}
                    sx={{
                      display: 'block',
                      py: 0.75,
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      color: active ? 'primary.main' : 'text.primary',
                      // Le lien actif est signalé par un filet sous le libellé,
                      // en plus de la couleur (§ 4.5 : pas d'information portée
                      // par la seule couleur).
                      borderBottom: '2px solid',
                      borderBottomColor: active ? 'primary.main' : 'transparent',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {item.label}
                  </AppLink>
                </li>
              )
            })}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, md: 1 },
            ml: { xs: 'auto', md: 1 },
          }}
        >
          <IconButton
            component={AppLink}
            href={searchPath}
            aria-label="Rechercher"
            size="small"
            sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: 'text.primary' }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>

          <Button
            component={AppLink}
            href="/#newsletter"
            color="accentQuiz"
            variant="contained"
            size="small"
            underline="none"
          >
            Newsletter
          </Button>

          <IconButton
            component={AppLink}
            href="/admin"
            aria-label="Espace rédaction"
            size="small"
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              color: colors.blueMid,
              border: `1px solid ${rule}`,
              borderRadius: '50%',
            }}
          >
            <PersonOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton
            ref={toggleRef}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={NAV_ID}
            // Nom accessible stable : l'état ouvert/fermé est porté par
            // `aria-expanded`, pas par le libellé.
            aria-label="Menu"
            sx={{ display: { md: 'none' }, color: 'text.primary' }}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Accordéon sous 900px : la navigation pousse le contenu plutôt que de le
          recouvrir, et disparaît du DOM interactif au-delà du point de rupture. */}
      <Collapse in={open} timeout={180} sx={{ display: { md: 'none' } }}>
        <Box component="nav" id={NAV_ID} aria-label="Navigation principale (mobile)">
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, pb: 1 }}>
            {items.map((item) => {
              const active = isActive(pathname, item.href)

              return (
                <Box component="li" key={item.href} sx={{ borderTop: `1px solid ${rule}` }}>
                  <AppLink
                    href={item.href}
                    onClick={() => setOpen(false)}
                    underline="none"
                    aria-current={active ? 'page' : undefined}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: active ? 'primary.main' : 'text.primary',
                    }}
                  >
                    {item.icon ? (
                      <SectionGlyph
                        name={item.icon}
                        fontSize="small"
                        sx={{ color: item.icon === 'quiz' ? 'accentQuiz.dark' : 'primary.main' }}
                      />
                    ) : null}
                    {item.label}
                  </AppLink>
                </Box>
              )
            })}

            <Box component="li" sx={{ borderTop: `1px solid ${rule}` }}>
              <AppLink
                href={searchPath}
                onClick={() => setOpen(false)}
                underline="none"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: 'text.primary',
                }}
              >
                <SearchIcon fontSize="small" sx={{ color: 'primary.main' }} />
                Rechercher
              </AppLink>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  )
}

export default SiteNav
