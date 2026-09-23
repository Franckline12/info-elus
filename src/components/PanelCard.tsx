import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

type Props = {
  title: string
  children: ReactNode
  /** Niveau de titre, à ajuster selon la hiérarchie de la page. */
  component?: 'h2' | 'h3'
  id?: string
}

/** Encart de colonne latérale : surface papier surélevé, titre court, filet fin. */
export function PanelCard({ title, children, component = 'h2', id }: Props) {
  return (
    <Card component="section" aria-labelledby={id}>
      <CardContent>
        <Typography
          id={id}
          component={component}
          sx={{ fontSize: '0.9375rem', fontWeight: 700, mb: 1.75 }}
        >
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  )
}

export default PanelCard
