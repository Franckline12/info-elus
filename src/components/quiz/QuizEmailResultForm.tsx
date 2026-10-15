'use client'

import { useCallback, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'

import { isValidEmail } from '@/lib/newsletter/email'
import { colors, fonts, radius, surfaceBorder } from '@/theme/tokens'

type Props = {
  quizId: number
  answers: number[]
  resultId?: number | null
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function QuizEmailResultForm({ quizId, answers, resultId }: Props) {
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [entrepriseCse, setEntrepriseCse] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (status === 'submitting') return

      const cleanNom = nom.trim()
      const cleanPrenom = prenom.trim()
      const cleanEmail = email.trim()
      const cleanEntreprise = entrepriseCse.trim()

      if (!cleanNom || !cleanPrenom) {
        setErrorMessage('Veuillez renseigner votre nom et votre prénom.')
        setStatus('error')
        return
      }

      if (!isValidEmail(cleanEmail)) {
        setErrorMessage('Veuillez renseigner une adresse email valide.')
        setStatus('error')
        return
      }

      setStatus('submitting')
      setErrorMessage(null)

      try {
        const response = await fetch('/api/quiz/send-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizId,
            resultId,
            answers,
            nom: cleanNom,
            prenom: cleanPrenom,
            email: cleanEmail,
            entrepriseCse: cleanEntreprise,
          }),
        })

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { message?: string } | null
          setErrorMessage(
            data?.message || 'Une erreur est survenue lors de l’envoi. Veuillez réessayer.',
          )
          setStatus('error')
          return
        }

        setStatus('success')
      } catch {
        setErrorMessage('Erreur réseau : vérifiez votre connexion puis réessayez.')
        setStatus('error')
      }
    },
    [answers, email, entrepriseCse, nom, prenom, quizId, status],
  )

  if (status === 'success') {
    return (
      <Box
        sx={{
          mt: 3,
          p: { xs: 2.5, md: 3 },
          backgroundColor: colors.sandPale,
          border: `1px solid ${colors.accentQuiz}`,
          borderRadius: `${radius}px`,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: '#fff',
            color: 'success.main',
            mb: 1.5,
          }}
        >
          <CheckCircleOutlinedIcon />
        </Box>
        <Typography
          component="h4"
          sx={{
            fontFamily: fonts.sans,
            fontSize: '1.125rem',
            fontWeight: 700,
            color: colors.ink,
            mb: 0.5,
          }}
        >
          Résultats envoyés !
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', m: 0 }}>
          Un récapitulatif complet de vos réponses et de votre score a été envoyé à l’adresse{' '}
          <strong>{email}</strong>.
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      component="section"
      aria-labelledby="quiz-send-result-title"
      sx={{
        mt: 3.5,
        p: { xs: 2.5, md: 3.5 },
        backgroundColor: colors.paperRaised,
        border: `1px solid ${surfaceBorder}`,
        borderRadius: `${radius}px`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <EmailOutlinedIcon sx={{ color: colors.blueDeep }} />
        <Typography
          id="quiz-send-result-title"
          component="h3"
          sx={{
            fontFamily: fonts.sans,
            fontSize: '1.125rem',
            fontWeight: 700,
            color: colors.blueDeep,
            m: 0,
          }}
        >
          Recevoir mes résultats par email
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
        Renseignez vos coordonnées pour recevoir votre score détaillé et le corrigé directement
        dans votre boîte de réception.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required
              fullWidth
              size="small"
              label="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              disabled={status === 'submitting'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required
              fullWidth
              size="small"
              label="Prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              disabled={status === 'submitting'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required
              fullWidth
              size="small"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'submitting'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Entreprise / CSE"
              placeholder="Ex: CSE Acme Corp"
              value={entrepriseCse}
              onChange={(e) => setEntrepriseCse(e.target.value)}
              disabled={status === 'submitting'}
            />
          </Grid>
        </Grid>

        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: `${radius}px` }}>
            {errorMessage}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5 }}>
          <Button
            type="submit"
            variant="contained"
            color="accentQuiz"
            disabled={status === 'submitting'}
            startIcon={status === 'submitting' ? <CircularProgress size={16} /> : undefined}
            sx={{ fontWeight: 600, color: colors.ink }}
          >
            {status === 'submitting' ? 'Envoi en cours…' : 'Envoyer mes résultats'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default QuizEmailResultForm
