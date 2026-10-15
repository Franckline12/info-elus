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
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined'

import { isValidEmail } from '@/lib/newsletter/email'
import { colors, fonts, radius, surfaceBorder } from '@/theme/tokens'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function ProviderSubscriptionForm() {
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (status === 'submitting') return

      const cleanNom = nom.trim()
      const cleanPrenom = prenom.trim()
      const cleanEmail = email.trim()
      const cleanCompany = company.trim()

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

      if (!cleanCompany) {
        setErrorMessage('Veuillez renseigner le nom de votre entreprise ou structure.')
        setStatus('error')
        return
      }

      setStatus('submitting')
      setErrorMessage(null)

      try {
        const response = await fetch('/api/providers/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom: cleanNom,
            prenom: cleanPrenom,
            email: cleanEmail,
            company: cleanCompany,
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
    [company, email, nom, prenom, status],
  )

  if (status === 'success') {
    return (
      <Box
        sx={{
          my: { xs: 3, md: 4 },
          p: { xs: 3, md: 4 },
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
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: '#fff',
            color: 'success.main',
            mb: 1.5,
          }}
        >
          <CheckCircleOutlinedIcon />
        </Box>
        <Typography
          component="h3"
          sx={{
            fontFamily: fonts.sans,
            fontSize: '1.25rem',
            fontWeight: 700,
            color: colors.ink,
            mb: 1,
          }}
        >
          Demande d’abonnement enregistrée !
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '64ch', mx: 'auto', m: 0 }}>
          Merci <strong>{prenom}</strong>. Votre demande pour la structure <strong>{company}</strong> a bien
          été prise en compte. Notre équipe va prendre contact avec vous à l’adresse <strong>{email}</strong>{' '}
          pour finaliser votre mise en avant grand format dans notre annuaire.
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      component="section"
      aria-labelledby="provider-subscription-title"
      sx={{
        my: { xs: 3, md: 4 },
        p: { xs: 2.5, sm: 3.5, md: 4 },
        backgroundColor: colors.paperRaised,
        border: `1px solid ${surfaceBorder}`,
        borderLeft: `5px solid ${colors.accentQuiz}`,
        borderRadius: `${radius}px`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75, mb: 2 }}>
        <Box
          aria-hidden
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: 40,
            height: 40,
            borderRadius: '8px',
            backgroundColor: colors.sandPale,
            color: colors.accentQuiz,
            mt: 0.25,
          }}
        >
          <HandshakeOutlinedIcon fontSize="small" />
        </Box>

        <Box>
          <Typography
            id="provider-subscription-title"
            component="h2"
            sx={{
              fontFamily: fonts.sans,
              fontSize: { xs: '1.125rem', md: '1.25rem' },
              fontWeight: 700,
              color: colors.blueDeep,
              lineHeight: 1.25,
              mb: 0.5,
            }}
          >
            Devenir prestataire abonné
          </Typography>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2.5 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required
              fullWidth
              size="small"
              label="Nom"
              placeholder="Votre nom"
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
              placeholder="Votre prénom"
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
              label="Adresse email"
              placeholder="contact@entreprise.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'submitting'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required
              fullWidth
              size="small"
              label="Nom de l’entreprise / CSE"
              placeholder="Ex: Cabinet Horizon Conseil"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={status === 'submitting'}
            />
          </Grid>
        </Grid>

        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: `${radius}px` }}>
            {errorMessage}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mt: 2.5 }}>
          <Button
            type="submit"
            variant="contained"
            color="accentQuiz"
            disabled={status === 'submitting'}
            startIcon={status === 'submitting' ? <CircularProgress size={16} /> : undefined}
            sx={{
              fontWeight: 700,
              color: colors.ink,
              px: 3,
              py: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {status === 'submitting' ? 'Envoi en cours…' : 'Devenir abonné'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default ProviderSubscriptionForm
