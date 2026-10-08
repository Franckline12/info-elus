'use client'

/**
 * Formulaire d'inscription à la lettre hebdomadaire (§ 2.6).
 *
 * Composant client : c'est une interaction, pas du contenu. Il n'inscrit
 * personne à lui seul — il poste une demande à `/api/newsletter/subscribe`, qui
 * envoie l'email de confirmation du double opt-in (§ 4.4). Le message de succès
 * annonce donc un email à venir, jamais une inscription acquise.
 *
 * Deux variantes d'affichage, toutes deux posées sur fond bleu profond : le
 * bloc large (accueil, bas d'article) et la version compacte du pied de page.
 */

import { useCallback, useId, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'

import AppLink from '@/components/AppLink'
import { isValidEmail } from '@/lib/newsletter/email'
import { CONSENT_NOTICE, INVALID_EMAIL, SUBSCRIBE_SUCCESS } from '@/lib/newsletter/messages'
import { colors, radius } from '@/theme/tokens'

type Props = {
  /** `block` : accueil et bas de contenu. `compact` : pied de page. */
  variant?: 'block' | 'compact'
  /** Page d'où vient la demande, transmise à l'API à titre informatif. */
  source?: string
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

const NETWORK_ERROR =
  'La demande n’a pas pu être envoyée : vérifiez votre connexion, puis réessayez.'
const THROTTLED =
  'Trop de demandes envoyées coup sur coup. Patientez quelques minutes, puis réessayez.'
const SERVER_ERROR = 'La demande n’a pas pu être enregistrée. Réessayez dans un instant.'

export function NewsletterForm({ variant = 'block', source }: Props) {
  const compact = variant === 'compact'

  // `useId` plutôt qu'un identifiant fixe : le formulaire est rendu deux fois
  // sur une même page (bloc + pied de page), les `for`/`aria-describedby` ne
  // doivent pas se croiser.
  const id = useId()
  const inputId = `${id}-email`
  const consentId = `${id}-consentement`
  const feedbackId = `${id}-message`

  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  const failWith = useCallback((text: string) => {
    setStatus('error')
    setMessage(text)
  }, [])

  const submit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (status === 'submitting') return

      const value = email.trim()

      // Même validation que côté serveur, pour éviter un aller-retour inutile.
      // Le serveur revalide : ce contrôle est un confort, pas une garantie.
      if (!isValidEmail(value)) {
        failWith(INVALID_EMAIL)
        inputRef.current?.focus()
        return
      }

      setStatus('submitting')
      setMessage('')

      try {
        const response = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: value, source, website: honeypot }),
        })

        if (response.ok) {
          const data = (await response.json()) as { message?: string }
          setStatus('success')
          setMessage(data.message ?? SUBSCRIBE_SUCCESS)
          // Les champs disparaissent : sans ce déplacement, le focus
          // retomberait sur le début de la page.
          requestAnimationFrame(() => successRef.current?.focus())
          return
        }

        if (response.status === 429) {
          failWith(THROTTLED)
          return
        }

        if (response.status === 400) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null
          failWith(data?.error ?? INVALID_EMAIL)
          inputRef.current?.focus()
          return
        }

        failWith(SERVER_ERROR)
      } catch {
        failWith(NETWORK_ERROR)
      }
    },
    [email, failWith, honeypot, source, status],
  )

  const invalid = status === 'error'
  const submitting = status === 'submitting'

  /**
   * Région d'annonce unique, toujours présente dans le DOM : une région
   * `aria-live` créée en même temps que son contenu n'est pas lue par tous les
   * lecteurs d'écran.
   */
  const feedback = (
    <Box
      id={feedbackId}
      role="status"
      aria-live="polite"
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0.75,
        // Vide, la région reste dans le DOM et dans l'arbre d'accessibilité
        // (hauteur nulle) : c'est ce qui garantit que la première annonce est
        // bien restituée.
        mt: message ? 1.5 : 0,
        color: invalid ? colors.accentQuiz : colors.bluePale,
        fontSize: compact ? '0.8125rem' : '0.875rem',
        lineHeight: 1.5,
      }}
    >
      {message ? (
        <>
          {invalid ? (
            <ErrorOutlineIcon aria-hidden sx={{ fontSize: '1.1em', mt: '0.15em', flexShrink: 0 }} />
          ) : null}
          <span>{message}</span>
        </>
      ) : null}
    </Box>
  )

  if (status === 'success') {
    return (
      <Box
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.25,
          p: compact ? 1.5 : 2,
          border: `1px solid ${colors.bluePale}`,
          borderRadius: `${radius}px`,
          color: colors.paper,
          fontSize: compact ? '0.8125rem' : '0.9375rem',
          lineHeight: 1.55,
        }}
      >
        <CheckCircleOutlinedIcon
          aria-hidden
          sx={{ color: colors.bluePale, fontSize: '1.3em', flexShrink: 0, mt: '0.1em' }}
        />
        <span>{message}</span>
      </Box>
    )
  }

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <Box
        sx={{
          display: 'flex',
          flexDirection: compact ? 'column' : { xs: 'column', sm: 'row' },
          alignItems: compact ? 'stretch' : { sm: 'flex-end' },
          gap: compact ? 1 : 1.5,
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {/*
            Libellé visible en permanence, et non un simple placeholder : une
            étiquette flottante disparaît dès la saisie, et un placeholder seul
            n'est pas un libellé pour un lecteur d'écran (§ 4.5).
          */}
          <Typography
            component="label"
            htmlFor={inputId}
            sx={{
              display: 'block',
              mb: 0.75,
              color: colors.paper,
              fontSize: compact ? '0.8125rem' : '0.875rem',
              fontWeight: 500,
            }}
          >
            Votre adresse email
          </Typography>

          <TextField
            inputRef={inputRef}
            id={inputId}
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              if (status === 'error') {
                setStatus('idle')
                setMessage('')
              }
            }}
            placeholder="prenom.nom@exemple.fr"
            autoComplete="email"
            required
            disabled={submitting}
            size="small"
            fullWidth
            error={invalid}
            aria-invalid={invalid}
            // Le message d'erreur et la mention de consentement sont rattachés
            // au champ : un lecteur d'écran les restitue au moment de la saisie.
            aria-describedby={`${consentId} ${feedbackId}`}
            sx={{
              '& .MuiInputBase-root': { backgroundColor: '#FFFFFF' },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: invalid ? colors.accentQuiz : colors.bluePale,
              },
            }}
          />
        </Box>

        {/*
          Champ piège : hors du flux visuel, hors du parcours clavier et masqué
          aux lecteurs d'écran. Un humain ne peut donc pas le remplir — un robot
          qui remplit tout se trahit, et la route ignore sa demande.
          `left: -9999px` plutôt que `display: none`, que certains robots savent
          détecter pour éviter précisément ce genre de piège.
        */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: '-9999px',
            // Des longueurs explicites : dans le système MUI, `width: 1`
            // signifie 100 %, pas un pixel.
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
        >
          <label htmlFor={`${id}-website`}>Ne pas remplir</label>
          <input
            id={`${id}-website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </Box>

        <Button
          type="submit"
          color="accentQuiz"
          variant="contained"
          disabled={submitting}
          fullWidth={compact}
          startIcon={
            submitting ? (
              <CircularProgress size={16} thickness={5} sx={{ color: 'inherit' }} />
            ) : undefined
          }
          sx={{ flexShrink: 0, px: 3, minHeight: 40 }}
        >
          {submitting ? 'Envoi…' : 'S’inscrire'}
        </Button>
      </Box>

      {feedback}

      <Typography
        id={consentId}
        component="p"
        sx={{
          m: 0,
          mt: 1.5,
          color: colors.bluePale,
          fontSize: compact ? '0.75rem' : '0.8125rem',
          lineHeight: 1.5,
        }}
      >
        {CONSENT_NOTICE}{' '}
        <AppLink
          href="/confidentialite"
          sx={{ color: colors.paper, textDecorationColor: colors.bluePale }}
        >
          Politique de confidentialité
        </AppLink>
        .
      </Typography>
    </Box>
  )
}

export default NewsletterForm
