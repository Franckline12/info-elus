import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'

import type { QuizStats } from '@/lib/queries/quizStats'
import { colors, radius } from '@/theme/tokens'

type Props = {
  stats: QuizStats
  /** Porte la nuance « ce quiz » plutôt que « tous les quiz ». */
  scope?: 'site' | 'quiz'
}

const numberFormat = new Intl.NumberFormat('fr-FR')

/**
 * Compteur communautaire du § 2.5 : parties jouées et taux de bonnes réponses.
 *
 * Composant serveur : les chiffres viennent d'une agrégation SQL mise en cache,
 * rien n'a besoin de vivre dans le navigateur.
 *
 * L'ocre est ici un filet et une icône, pas un aplat : le texte reste sur fond
 * papier, où son contraste est le même que partout ailleurs.
 */
export function QuizCounter({ stats, scope = 'site' }: Props) {
  const played = stats.plays > 0

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1.5, sm: 2.5 },
        flexWrap: 'wrap',
        px: { xs: 1.75, md: 2.25 },
        py: 1.5,
        borderLeft: `3px solid ${colors.accentQuiz}`,
        backgroundColor: colors.sandPale,
        borderRadius: `${radius}px`,
      }}
    >
      <GroupsOutlinedIcon aria-hidden sx={{ color: colors.accentQuiz, fontSize: '1.25rem' }} />

      {played ? (
        <>
          <Typography component="p" sx={{ m: 0, fontSize: '0.9375rem' }}>
            <Box component="strong" sx={{ fontWeight: 700 }}>
              {numberFormat.format(stats.plays)}
            </Box>{' '}
            partie{stats.plays > 1 ? 's' : ''} jouée{stats.plays > 1 ? 's' : ''}
            {scope === 'quiz' ? ' sur ce quiz' : ''}
          </Typography>

          <Typography component="p" sx={{ m: 0, fontSize: '0.9375rem' }}>
            <Box component="strong" sx={{ fontWeight: 700 }}>
              {stats.successRate} %
            </Box>{' '}
            de bonnes réponses
          </Typography>
        </>
      ) : (
        // Sans partie enregistrée, un « 0 % de bonnes réponses » serait
        // décourageant et faux : il n'y a pas de taux, il n'y a pas de données.
        <Typography component="p" sx={{ m: 0, fontSize: '0.9375rem' }}>
          {scope === 'quiz'
            ? 'Personne n’a encore joué ce quiz : ouvrez le bal.'
            : 'Aucune partie jouée pour l’instant : lancez la première.'}
        </Typography>
      )}
    </Box>
  )
}

export default QuizCounter
