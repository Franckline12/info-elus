'use client'

/**
 * Parcours de jeu d'un quiz (§ 2.5) : une question à la fois, retour immédiat,
 * score et récapitulatif en fin de parcours.
 *
 * Composant client — c'est une interaction, pas du contenu. Il ne reçoit qu'un
 * `PlayableQuiz` : ni `isCorrect`, ni explication. La correction est demandée à
 * `/api/quiz/answer` après chaque réponse, ce qui garantit que le code source
 * de la page ne contient pas les solutions.
 *
 * La partie terminée est enregistrée anonymement par `/api/quiz/result` (quiz,
 * score, barème, horodatage) : c'est la source du compteur communautaire. Rien
 * qui identifie le joueur n'est transmis.
 */

import { useCallback, useRef, useState } from 'react'
import Alert from '@mui/material/Alert'
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

import AppLink from '@/components/AppLink'
import QuizEmailResultForm from '@/components/quiz/QuizEmailResultForm'
import type { PlayableQuiz } from '@/lib/quiz/playable'
import { quizzesPath } from '@/lib/routes'
import { colors, radius, surfaceBorder } from '@/theme/tokens'

type Props = {
  quiz: PlayableQuiz
  /** Quiz proposé depuis l'écran final, pour prolonger la partie. */
  nextQuiz?: { slug: string; title: string } | null
}

/** Correction d'une question, telle que renvoyée par l'API. */
type Feedback = {
  correctIndex: number
  isCorrect: boolean
  points: number
  explanation: string | null
}

/** Réponse du joueur, une fois corrigée par le serveur. */
type PlayedAnswer = Feedback & { answer: number }

type SaveState = 'idle' | 'saving' | 'saved' | 'error' | 'throttled'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/** Transitions coupées pour qui a demandé moins de mouvement (§ 4.5). */
const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

export function QuizRunner({ quiz, nextQuiz = null }: Props) {
  const questions = quiz.questions

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [played, setPlayed] = useState<PlayedAnswer[]>([])
  const [finished, setFinished] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [resultId, setResultId] = useState<number | null>(null)

  /**
   * Garde-fou contre le double envoi : un double clic sur « Voir mon score »
   * ne doit pas compter deux parties dans le compteur communautaire.
   */
  const savingRef = useRef(false)

  const question = questions[index]
  const options = question?.options ?? []
  const score = played.reduce((sum, answer) => sum + (answer.isCorrect ? answer.points : 0), 0)
  const correctCount = played.filter((answer) => answer.isCorrect).length

  const validate = useCallback(async () => {
    if (selected === null || pending || feedback) return

    setPending(true)
    setError(null)

    try {
      const response = await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: quiz.id, question: index, answer: selected }),
      })

      if (!response.ok) {
        setError(
          response.status === 429
            ? 'Trop de réponses envoyées coup sur coup. Patientez quelques instants, puis réessayez.'
            : 'La correction n’a pas pu être récupérée. Réessayez.',
        )
        return
      }

      const result = (await response.json()) as Feedback

      setFeedback(result)
      setPlayed((list) => [...list, { ...result, answer: selected }])
    } catch {
      setError('Correction indisponible : vérifiez votre connexion, puis réessayez.')
    } finally {
      setPending(false)
    }
  }, [feedback, index, pending, quiz.id, selected])

  /** Enregistre la partie terminée. Le serveur recalcule le score lui-même. */
  const save = useCallback(
    async (answers: number[]) => {
      if (savingRef.current) return
      savingRef.current = true
      setSaveState('saving')

      try {
        const response = await fetch('/api/quiz/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizId: quiz.id, answers }),
        })

        if (response.status === 429) {
          setSaveState('throttled')
          return
        }

        if (response.ok) {
          const data = (await response.json()) as { resultId?: number }
          if (typeof data.resultId === 'number') {
            setResultId(data.resultId)
          }
          setSaveState('saved')
        } else {
          setSaveState('error')
        }
      } catch {
        setSaveState('error')
      }
    },
    [quiz.id],
  )

  const next = useCallback(() => {
    if (index + 1 >= questions.length) {
      setFinished(true)
      // L'enregistrement part de l'action du joueur, pas d'un effet : le bouton
      // n'existe qu'une fois la dernière question corrigée, donc `played`
      // contient déjà toutes les réponses à cet instant.
      void save(played.map((answer) => answer.answer))
      return
    }
    setIndex((value) => value + 1)
    setSelected(null)
    setFeedback(null)
    setError(null)
  }, [index, played, questions.length, save])

  const restart = useCallback(() => {
    savingRef.current = false
    setIndex(0)
    setSelected(null)
    setFeedback(null)
    setError(null)
    setPlayed([])
    setFinished(false)
    setSaveState('idle')
    setResultId(null)
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
    const perfect = score === quiz.totalPoints

    return (
      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Box sx={{ textAlign: 'center', pb: { xs: 2, md: 3 } }}>
            <Typography component="p" variant="overline" sx={{ color: 'text.secondary' }}>
              Score final
            </Typography>
            <Typography
              component="p"
              sx={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.1, m: 0 }}
            >
              {score} / {quiz.totalPoints}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, m: 0 }}>
              {correctCount} bonne{correctCount > 1 ? 's' : ''} réponse
              {correctCount > 1 ? 's' : ''} sur {questions.length}
              {perfect ? ' — sans faute, vos connaissances sont à jour.' : ''}
            </Typography>
          </Box>

          <Box component="section" aria-labelledby="quiz-recapitulatif">
            <Typography
              id="quiz-recapitulatif"
              component="h3"
              sx={{ fontSize: '1rem', fontWeight: 700, mb: 1.5 }}
            >
              Récapitulatif
            </Typography>

            <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: 1.5 }}>
              {played.map((answer, position) => {
                const playedQuestion = questions[position]

                return (
                  <Box
                    component="li"
                    key={position}
                    sx={{
                      px: 2,
                      py: 1.5,
                      border: '1px solid',
                      borderColor: answer.isCorrect ? 'success.main' : 'error.main',
                      borderRadius: `${radius}px`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                      {answer.isCorrect ? (
                        <CheckCircleOutlinedIcon
                          aria-hidden
                          sx={{ fontSize: '1.1rem', color: 'success.main' }}
                        />
                      ) : (
                        <HighlightOffIcon
                          aria-hidden
                          sx={{ fontSize: '1.1rem', color: 'error.main' }}
                        />
                      )}
                      <Typography
                        component="p"
                        sx={{ m: 0, fontSize: '0.8125rem', fontWeight: 700 }}
                      >
                        Question {position + 1} —{' '}
                        {answer.isCorrect ? 'Bonne réponse' : 'Réponse incorrecte'}
                      </Typography>
                    </Box>

                    <Typography component="p" sx={{ m: 0, fontSize: '0.9375rem', mb: 0.5 }}>
                      {playedQuestion?.prompt}
                    </Typography>

                    <Typography
                      component="p"
                      sx={{ m: 0, fontSize: '0.875rem', color: 'text.secondary' }}
                    >
                      Réponse correcte : {playedQuestion?.options[answer.correctIndex]?.text ?? '—'}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          </Box>

          <Box aria-live="polite" sx={{ mt: 2.5 }}>
            {saveState === 'saving' ? (
              <Typography
                component="p"
                sx={{ m: 0, fontSize: '0.875rem', color: 'text.secondary' }}
              >
                Enregistrement de votre partie…
              </Typography>
            ) : null}

            {saveState === 'saved' ? (
              <Typography
                component="p"
                sx={{ m: 0, fontSize: '0.875rem', color: 'text.secondary' }}
              >
                Partie enregistrée : elle alimente le compteur communautaire.
              </Typography>
            ) : null}

            {saveState === 'throttled' || saveState === 'error' ? (
              <Alert severity="warning" sx={{ borderRadius: `${radius}px` }}>
                {saveState === 'throttled'
                  ? 'Trop de parties enregistrées coup sur coup : celle-ci ne sera pas comptée.'
                  : 'Votre partie n’a pas pu être enregistrée. Votre score reste affiché ci-dessus.'}
              </Alert>
            ) : null}
          </Box>

          <QuizEmailResultForm
            quizId={quiz.id}
            answers={played.map((answer) => answer.answer)}
            resultId={resultId}
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
              mt: 3,
            }}
          >
            <Button onClick={restart} color="accentQuiz" variant="contained">
              Rejouer ce quiz
            </Button>

            {nextQuiz ? (
              <AppLink href={`${quizzesPath}/${nextQuiz.slug}`}>Jouer « {nextQuiz.title} »</AppLink>
            ) : (
              <AppLink href={quizzesPath}>Voir tous les quiz</AppLink>
            )}
          </Box>
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
            Question {index + 1} sur {questions.length}
          </Typography>
          <Typography component="p" sx={{ fontSize: '0.8125rem', color: 'text.secondary', m: 0 }}>
            {score} point{score > 1 ? 's' : ''}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={((index + (feedback ? 1 : 0)) / questions.length) * 100}
          aria-label="Progression dans le quiz"
          sx={{
            height: 6,
            borderRadius: `${radius}px`,
            backgroundColor: colors.bluePale,
            mb: 3,
            '& .MuiLinearProgress-bar': {
              backgroundColor: colors.accentQuiz,
              [REDUCED_MOTION]: { transition: 'none' },
            },
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
              if (feedback) return
              setSelected(Number(event.target.value))
            }}
            sx={{ display: 'grid', gap: 1.25 }}
          >
            {options.map((option, optionIndex) => {
              const isAnswer = feedback ? optionIndex === feedback.correctIndex : false
              const isWrongPick = feedback ? optionIndex === selected && !feedback.isCorrect : false

              return (
                <FormControlLabel
                  key={optionIndex}
                  value={String(optionIndex)}
                  disabled={feedback !== null}
                  control={<Radio size="small" disableRipple sx={{ mr: 0.5 }} />}
                  label={
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ fontWeight: 700 }}>
                        {LETTERS[optionIndex] ?? optionIndex + 1}.
                      </Box>
                      {option.text}
                      {isAnswer ? (
                        <CheckCircleOutlinedIcon
                          aria-label="Réponse correcte"
                          sx={{ fontSize: '1.1rem', color: 'success.main' }}
                        />
                      ) : null}
                      {isWrongPick ? (
                        <HighlightOffIcon
                          aria-label="Votre réponse, incorrecte"
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
                      selected === optionIndex && !feedback ? colors.bluePale : 'transparent',
                    transition: 'border-color 120ms ease, background-color 120ms ease',
                    [REDUCED_MOTION]: { transition: 'none' },
                    '&.Mui-disabled': { opacity: 1 },
                    '& .MuiFormControlLabel-label': { fontSize: '0.9375rem' },
                    '& .MuiFormControlLabel-label.Mui-disabled': { color: 'text.primary' },
                  }}
                />
              )
            })}
          </RadioGroup>
        </FormControl>

        {/*
          Le résultat n'est jamais porté par la seule couleur (§ 4.5) : icône,
          libellé explicite, et annonce au lecteur d'écran par cette région.
        */}
        <Box aria-live="polite">
          {feedback ? (
            <Box
              sx={{
                mt: 2.5,
                px: 2,
                py: 1.5,
                backgroundColor: feedback.isCorrect ? colors.bluePale : colors.sandPale,
                borderLeft: `3px solid ${feedback.isCorrect ? colors.blueBright : colors.accentQuiz}`,
                borderRadius: `${radius}px`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                {feedback.isCorrect ? (
                  <CheckCircleOutlinedIcon
                    aria-hidden
                    sx={{ fontSize: '1.15rem', color: 'success.main' }}
                  />
                ) : (
                  <HighlightOffIcon aria-hidden sx={{ fontSize: '1.15rem', color: 'error.main' }} />
                )}
                <Typography component="p" sx={{ fontWeight: 700, fontSize: '0.875rem', m: 0 }}>
                  {feedback.isCorrect ? 'Bonne réponse' : 'Réponse incorrecte'}
                </Typography>
              </Box>

              {feedback.explanation ? (
                <Typography variant="body2" sx={{ m: 0 }}>
                  {feedback.explanation}
                </Typography>
              ) : null}
            </Box>
          ) : null}

          {error ? (
            <Alert severity="error" sx={{ mt: 2, borderRadius: `${radius}px` }}>
              {error}
            </Alert>
          ) : null}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          {feedback ? (
            <Button onClick={next} color="accentQuiz" variant="contained">
              {index + 1 >= questions.length ? 'Voir mon score' : 'Question suivante'}
            </Button>
          ) : (
            <Button
              onClick={validate}
              color="accentQuiz"
              variant="contained"
              disabled={selected === null || pending}
            >
              {pending ? 'Correction…' : 'Valider ma réponse'}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default QuizRunner
