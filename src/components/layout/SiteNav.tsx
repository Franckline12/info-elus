'use client'

/**
 * Seul composant client du socle : il a besoin du chemin courant (lien actif) et
 * d'un état local (accordéon sous 900px). Le reste du header est rendu côté serveur.
 */

import { useCallback, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import CloseIcon from '@mui/icons-material/Close'
import MenuIcon from '@mui/icons-material/Menu'
import { usePathname } from 'next/navigation'

import AppLink from '@/components/AppLink'
import type { NavItem } from '@/lib/site'
import { rule } from '@/theme/tokens'

const NAV_ID = 'site-nav'

const isActive = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`)

type Props = {
  items: NavItem[]
}

export function SiteNav({ items }: Props) {
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
      <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end', py: 0.5 }}>
        <Button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={NAV_ID}
          startIcon={open ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
          sx={{ color: 'text.primary', px: 1 }}
        >
          Menu
        </Button>
      </Box>

      <Collapse
        in={open}
        timeout={180}
        // À partir de 900px la navigation est toujours déployée : on neutralise
        // la fermeture du Collapse plutôt que de dupliquer le menu dans le DOM.
        sx={(theme) => ({
          [theme.breakpoints.up('md')]: {
            height: 'auto !important',
            overflow: 'visible !important',
            visibility: 'visible !important',
          },
        })}
      >
        <Box
          component="nav"
          id={NAV_ID}
          aria-label="Navigation principale"
          sx={{ pb: { xs: 1, md: 0 } }}
        >
          <Box
            component="ul"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 0, md: 3.5 },
              listStyle: 'none',
              m: 0,
              p: 0,
            }}
          >
            {items.map((item) => {
              const active = isActive(pathname, item.href)

              return (
                <Box
                  component="li"
                  key={item.href}
                  sx={{
                    borderTop: { xs: `1px solid ${rule}`, md: 'none' },
                    '&:first-of-type': { borderTop: { xs: 'none', md: 'none' } },
                  }}
                >
                  <AppLink
                    href={item.href}
                    onClick={() => setOpen(false)}
                    underline="none"
                    aria-current={active ? 'page' : undefined}
                    sx={{
                      display: 'block',
                      py: { xs: 1.5, md: 1.25 },
                      fontSize: { xs: '1rem', md: '0.9375rem' },
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: active ? 'primary.main' : 'text.primary',
                      // Le lien actif est signalé par un filet épais sous le
                      // libellé, en plus de la couleur (§ 4.5 : pas d'information
                      // portée par la seule couleur).
                      borderBottom: '2px solid',
                      borderBottomColor: active ? 'primary.main' : 'transparent',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {item.label}
                  </AppLink>
                </Box>
              )
            })}
          </Box>
        </Box>
      </Collapse>
    </Box>
  )
}

export default SiteNav
