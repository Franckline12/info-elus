import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'

import { colors, radius } from '@/theme/tokens'

/**
 * Bloc d'inscription à la lettre hebdomadaire (§ 2.6).
 *
 * Le formulaire est rendu mais inactif : la collection des abonnés et le
 * parcours de double opt-in (§ 4.4) restent à créer. Aucun `action` n'est posé
 * pour ne pas exposer l'adresse saisie dans l'URL en attendant.
 */
export function NewsletterBlock() {
  return (
    <Box
      component="section"
      id="newsletter"
      aria-labelledby="newsletter-titre"
      sx={{
        height: '100%',
        bgcolor: colors.blueDeep,
        color: colors.paper,
        borderRadius: `${radius}px`,
        px: { xs: 2.5, sm: 3.5, md: 4 },
        py: { xs: 3, md: 3.5 },
        '& :focus-visible': { outlineColor: colors.paper },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
        <Box
          aria-hidden
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: 'rgba(228, 233, 251, 0.16)',
            color: colors.bluePale,
          }}
        >
          <EmailOutlinedIcon fontSize="small" />
        </Box>

        <Box>
          <Typography
            id="newsletter-titre"
            component="h2"
            sx={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.2, mb: 0.75 }}
          >
            Recevez notre newsletter
          </Typography>
          <Typography
            component="p"
            sx={{ color: colors.bluePale, fontSize: '0.875rem', m: 0, maxWidth: '46ch' }}
          >
            Actualités, guides, conseils… restez informé des dernières évolutions du CSE.
          </Typography>
        </Box>
      </Box>

      <Box
        component="form"
        sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}
      >
        <TextField
          type="email"
          name="email"
          label="Votre adresse email"
          autoComplete="email"
          size="small"
          fullWidth
          disabled
          aria-describedby="newsletter-indisponible"
          sx={{
            '& .MuiInputLabel-root': { color: colors.textSecondary },
            '& .MuiInputBase-root.Mui-disabled': { backgroundColor: colors.paperRaised },
          }}
        />
        <Button
          type="submit"
          color="accentQuiz"
          variant="contained"
          disabled
          sx={{
            flexShrink: 0,
            px: 3,
            '&.Mui-disabled': {
              backgroundColor: colors.accentQuiz,
              color: colors.ink,
              opacity: 0.6,
            },
          }}
        >
          S’inscrire
        </Button>
      </Box>

      <Typography
        id="newsletter-indisponible"
        component="p"
        variant="caption"
        sx={{ display: 'block', m: 0, mt: 1.5, color: colors.bluePale }}
      >
        L’inscription sera activée avec la mise en place de la lettre hebdomadaire et de son double
        opt-in.
      </Typography>
    </Box>
  )
}

export default NewsletterBlock
