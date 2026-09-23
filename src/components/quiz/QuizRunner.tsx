'use client'

/**
 * Parcours de jeu d'un quiz (§ 2.5) : une question à la fois, retour immédiat,
 * score final. Composant client — c'est une interaction, pas du contenu.
 * Aucun score n'est envoyé au serveur : la collection ne stocke rien pour
 * l'instant (pas de classement en V1).
 */

import { useCallback, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import LinearProgress from '@mui/material/LinearProgress'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Typography from '@mui/material/Typography'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

import type { Quiz } from '@/payload-types'
import { colors, radius, surfaceBorder } from '@/theme/tokens'

type Props = {
  quiz: Quiz
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function QuizRunner({ quiz }: Props) {
  const questions = useMemo(() => quiz.questions ?? [], [quiz.questions])

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [validated, setValidated] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = questions[index]
  const options = question?.options ?? []
  const correctIndex = options.findIndex((option) => option.isCorrect)
  const isCorrect = validated && selected === correctIndex

  const validate = useCallback(() => {
    if (selected === null) return
    setValidated(true)
    if (selected === correctIndex) setScore((value) => value + 1)
  }, [correctIndex, selected])

  const next = useCallback(() => {
    if (index + 1 >= questions.length) {
      setFinished(true)
      return
    }
    setIndex((value) => value + 1)
    setSelected(null)
    setValidated(false)
  }, [index, questions.length])

  const restart = useCallback(() => {
    setIndex(0)
    setSelected(null)
    setValidated(false)
    setScore(0)
    setFinished(false)
  }, [])

  if (questions.length === 0 || !question) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body1" sx={{ color: 'text.secondary', m: 0 }}>
            Ce quiz ne contient pas encore de question.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  if (finished) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: { xs: 4, md: 6 } }}>
          <Typography component="p" variant="overline" sx={{ color: 'text.secondary' }}>
            Score final
          </Typography>
          <Typography component="p" sx={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.1 }}>
            {score} / {questions.length}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>
            {score === questions.length
              ? 'Sans faute : vos connaissances sont à jour.'
              : 'Rejouez le quiz pour consolider les réponses manquées.'}
          </Typography>
          <Button onClick={restart} color="accentQuiz" variant="contained">
            Rejouer le quiz
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 2,
            mb: 1,
          }}
        >
          <Typography component="p" sx={{ fontSize: '0.875rem', fontWeight: 700, m: 0 }}>
            Question {index + 1} / {questions.length}
          </Typography>
          <Typography component="p" sx={{ fontSize: '0.8125rem', color: 'text.secondary', m: 0 }}>
            {score} bonne{score > 1 ? 's' : ''} réponse{score > 1 ? 's' : ''}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={((index + (validated ? 1 : 0)) / questions.length) * 100}
          aria-label="Progression dans le quiz"
          sx={{
            height: 6,
            borderRadius: `${radius}px`,
            backgroundColor: colors.bluePale,
            mb: 3,
            '& .MuiLinearProgress-bar': { backgroundColor: colors.accentQuiz },
          }}
        />

        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <FormLabel
            component="legend"
            sx={{
              fontSize: { xs: '1.0625rem', md: '1.1875rem' },
              fontWeight: 700,
              color: 'text.primary',
              mb: 2,
              '&.Mui-focused': { color: 'text.primary' },
            }}
          >
            {question.prompt}
          </FormLabel>

          <RadioGroup
            value={selected === null ? '' : String(selected)}
            onChange={(event) => {
              if (validated) return
              setSelected(Number(event.target.value))
            }}
            sx={{ display: 'grid', gap: 1.25 }}
          >
            {options.map((option, optionIndex) => {
              const isAnswer = validated && optionIndex === correctIndex
              const isWrongPick = validated && optionIndex === selected && !isCorrect

              return (
                <FormControlLabel
                  key={option.id ?? optionIndex}
                  value={String(optionIndex)}
                  disabled={validated}
                  control={<Radio size="small" disableRipple sx={{ mr: 0.5 }} />}
                  label={
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ fontWeight: 700 }}>
                        {LETTERS[optionIndex] ?? optionIndex + 1}.
                      </Box>
                      {option.text}
                      {isAnswer ? (
                        <CheckCircleOutlinedIcon
                          aria-label="Bonne réponse"
                          sx={{ fontSize: '1.1rem', color: 'success.main' }}
                        />
                      ) : null}
                      {isWrongPick ? (
                        <HighlightOffIcon
                          aria-label="Mauvaise réponse"
                          sx={{ fontSize: '1.1rem', color: 'error.main' }}
                        />
                      ) : null}
                    </Box>
                  }
                  sx={{
                    m: 0,
                    px: 1.5,
                    py: 1,
                    border: '1px solid',
                    borderColor: isAnswer
                      ? 'success.main'
                      : isWrongPick
                        ? 'error.main'
                        : surfaceBorder,
                    borderRadius: `${radius}px`,
                    backgroundColor:
                      selected === optionIndex && !validated ? colors.bluePale : 'transparent',
                    '&.Mui-disabled': { opacity: 1 },
                    '& .MuiFormControlLabel-label': { fontSize: '0.9375rem' },
                    '& .MuiFormControlLabel-label.Mui-disabled': { color: 'text.primary' },
                  }}
                />
              )
            })}
          </RadioGroup>
        </FormControl>

        {validated ? (
          <Box
            role="status"
            sx={{
              mt: 2.5,
              px: 2,
              py: 1.5,
              backgroundColor: isCorrect ? colors.bluePale : colors.sandPale,
              borderLeft: `3px solid ${isCorrect ? colors.blueBright : colors.accentQuiz}`,
              borderRadius: `${radius}px`,
            }}
          >
            <Typography component="p" sx={{ fontWeight: 700, fontSize: '0.875rem', m: 0, mb: 0.5 }}>
              {isCorrect ? 'Bonne réponse' : 'Mauvaise réponse'}
            </Typography>
            {question.explanation ? (
              <Typography variant="body2" sx={{ m: 0 }}>
                {question.explanation}
              </Typography>
            ) : null}
          </Box>
        ) : null}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          {validated ? (
            <Button onClick={next} color="accentQuiz" variant="contained">
              {index + 1 >= questions.length ? 'Voir mon score' : 'Question suivante'}
            </Button>
          ) : (
            <Button
              onClick={validate}
              color="accentQuiz"
              variant="contained"
              disabled={selected === null}
            >
              Valider ma réponse
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default QuizRunner
