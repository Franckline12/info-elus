import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined'

import AppLink from '@/components/AppLink'
import { formatLongDate, toDateTimeAttribute } from '@/lib/formatDate'
import type { QuizSummary } from '@/lib/quiz/playable'
import { quizPath } from '@/lib/routes'
import { colors, radius, rule } from '@/theme/tokens'

type Props = {
  quiz: QuizSummary
  /** Niveau de titre, à ajuster selon la page d'accueil ou le listing. */
  component?: 'h2' | 'h3'
  id?: string
}

/**
 * Mise en avant du quiz de la semaine (§ 2.5), sur le listing comme sur
 * l'accueil.
 *
 * L'ocre y est un filet, une icône et un bouton — jamais un aplat de fond
 * derrière du texte courant. Le seul texte posé sur de l'ocre est le libellé du
 * bouton, en encre (#10152B sur #E3A23E : contraste 8,2:1, au-delà du AA exigé
 * par le § 4.5).
 */
export function FeaturedQuiz({ quiz, component = 'h2', id }: Props) {
  const href = quizPath(quiz)

  return (
    <Box
      component="article"
      sx={{
        borderTop: `3px solid ${colors.accentQuiz}`,
        borderBottom: `1px solid ${rule}`,
        backgroundColor: colors.paperRaised,
        borderRadius: `${radius}px`,
        px: { xs: 2.5, md: 4 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <ExtensionOutlinedIcon aria-hidden sx={{ color: colors.accentQuiz, fontSize: '1.15rem' }} />
        <Typography
          component="p"
          variant="overline"
          sx={{ m: 0, color: 'text.secondary', letterSpacing: '0.08em' }}
        >
          Quiz de la semaine
        </Typography>
        {quiz.week ? (
          <Typography
            component="time"
            dateTime={toDateTimeAttribute(quiz.week)}
            sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}
          >
            {formatLongDate(quiz.week)}
          </Typography>
        ) : null}
      </Box>

      <Typography
        id={id}
        variant="h2"
        component={component}
        sx={{ fontSize: { xs: '1.375rem', md: '1.75rem' }, mb: quiz.intro ? 1.5 : 2 }}
      >
        <AppLink href={href} underline="none" sx={{ color: 'text.primary' }}>
          {quiz.title}
        </AppLink>
      </Typography>

      {quiz.intro ? (
        <Typography variant="lede" component="p" sx={{ maxWidth: '62ch', mb: 2.5 }}>
          {quiz.intro}
        </Typography>
      ) : null}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          flexWrap: 'wrap',
        }}
      >
        <Button
          component={AppLink}
          href={href}
          color="accentQuiz"
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          underline="none"
        >
          Jouer le quiz
        </Button>

        {quiz.theme ? <Chip label={quiz.theme.name} size="small" /> : null}

        <Typography component="p" sx={{ m: 0, fontSize: '0.8125rem', color: 'text.secondary' }}>
          {quiz.questionCount} question{quiz.questionCount > 1 ? 's' : ''}
        </Typography>
      </Box>
    </Box>
  )
}

export default FeaturedQuiz
