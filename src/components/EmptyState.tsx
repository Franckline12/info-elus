import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { rule } from '@/theme/tokens'

type Props = {
  title: string
  description?: string
}

/** Message affiché lorsqu'une liste ne renvoie aucun résultat. */
export function EmptyState({ title, description }: Props) {
  return (
    <Box
      sx={{
        py: { xs: 5, md: 7 },
        px: { xs: 2, md: 3 },
        borderTop: `1px solid ${rule}`,
        borderBottom: `1px solid ${rule}`,
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" component="p" sx={{ mb: description ? 1 : 0 }}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '48ch', mx: 'auto' }}>
          {description}
        </Typography>
      ) : null}
    </Box>
  )
}

export default EmptyState
