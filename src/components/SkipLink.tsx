import Link from '@mui/material/Link'

/**
 * Lien d'évitement : masqué jusqu'à ce qu'il reçoive le focus clavier, il permet
 * de sauter la navigation pour atteindre directement le contenu (§ 4.5).
 */
export function SkipLink({ targetId = 'contenu' }: { targetId?: string }) {
  return (
    <Link
      href={`#${targetId}`}
      sx={{
        position: 'absolute',
        left: 8,
        top: 8,
        zIndex: 10,
        px: 2,
        py: 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: '1px solid',
        borderColor: 'divider',
        transform: 'translateY(-200%)',
        '&:focus-visible': { transform: 'translateY(0)' },
      }}
    >
      Aller au contenu
    </Link>
  )
}

export default SkipLink
