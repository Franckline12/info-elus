import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined'

import AppLink from '@/components/AppLink'
import { quizPath } from '@/lib/routes'
import { asTheme } from '@/lib/themeColor'
import type { Quiz } from '@/payload-types'
import { colors } from '@/theme/tokens'

type Props = {
  quiz: Quiz
}

/** Vignette de quiz : l'ocre y est la couleur d'accent de la rubrique (§ 5.3). */
export function QuizCard({ quiz }: Props) {
  const theme = asTheme(quiz.theme)
  const href = quizPath(quiz)
  const questionCount = quiz.questions?.length ?? 0

  return (
    <Card
      component="article"
      sx={{
        height: '100%',
        borderLeft: `3px solid ${colors.accentQuiz}`,
        '&:hover': { borderColor: colors.accentQuiz },
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
          <ExtensionOutlinedIcon
            aria-hidden
            sx={{ color: colors.accentQuiz, fontSize: '1.1rem' }}
          />
          {theme ? <Chip label={theme.name} size="small" /> : null}
        </Box>

        <Typography variant="h4" component="h3" sx={{ fontSize: '1rem', mb: 1 }}>
          <AppLink href={href} underline="none" sx={{ color: 'text.primary' }}>
            {quiz.title}
          </AppLink>
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          {quiz.excerpt}
        </Typography>

        {questionCount > 0 ? (
          <Typography
            component="p"
            sx={{ mt: 'auto', fontSize: '0.8125rem', color: 'text.secondary', m: 0 }}
          >
            {questionCount} question{questionCount > 1 ? 's' : ''}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default QuizCard
