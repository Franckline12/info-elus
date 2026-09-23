'use client'

import MuiLink from '@mui/material/Link'
import type { LinkProps as MuiLinkProps } from '@mui/material/Link'
import NextLink from 'next/link'
import type { LinkProps as NextLinkProps } from 'next/link'
import { forwardRef } from 'react'

export type AppLinkProps = Omit<MuiLinkProps, 'href' | 'component'> &
  Pick<NextLinkProps, 'href' | 'prefetch' | 'replace' | 'scroll'>

/**
 * Lien MUI monté sur le `Link` de Next : navigation côté client, sans
 * rechargement complet de la page.
 *
 * Ce composant porte la frontière `'use client'` parce qu'un composant serveur ne
 * peut pas passer `component={NextLink}` (une fonction) à un composant client.
 * Il n'ajoute aucun état ni effet : `@mui/material/Link` était déjà un composant
 * client, le poids du bundle est inchangé.
 */
export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(function AppLink(props, ref) {
  return <MuiLink ref={ref} component={NextLink} {...props} />
})

export default AppLink
