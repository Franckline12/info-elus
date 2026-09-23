import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Image from 'next/image'

import type { ReactNode } from 'react'

import MediaImage from '@/components/MediaImage'
import type { Media } from '@/payload-types'
import { colors, radius } from '@/theme/tokens'

type Props = {
  title: string
  description?: string
  /** Illustration de droite, quand la rubrique en possède une dans le CMS. */
  image?: Media | number | null
  /**
   * Bandeau photographique de la rubrique, servi depuis `public/images`.
   * Purement décoratif : il est recouvert d'un voile uni et son `alt` est vide.
   */
  backgroundImage?: string
  /**
   * Cadrage de la bannière. Par défaut `right center` : les panoramas fournis
   * portent leur sujet à droite. À ajuster image par image.
   */
  backgroundPosition?: string
  /** `quiz` : bandeau ocre, réservé à la section Jeux & Quiz (§ 5.3). */
  tone?: 'blue' | 'quiz'
  children?: ReactNode
}

/**
 * Bandeau d'ouverture des pages de rubrique : bloc bleu profond, titre et
 * accroche (maquette « Toute l'actualité CSE », « Guides CSE »).
 *
 * Avec `backgroundImage`, la photo occupe tout le bandeau sous un aplat bleu
 * profond à 86 % : le texte reste en contraste AA, et l'aplat évite le dégradé
 * proscrit par le § 5.3.
 */
export function PageHero({
  title,
  description,
  image,
  backgroundImage,
  backgroundPosition = 'right center',
  tone = 'blue',
  children,
}: Props) {
  const quiz = tone === 'quiz'

  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: backgroundImage
            ? 'minmax(0, 0.56fr) minmax(0, 0.44fr)'
            : image
              ? '1.2fr 0.8fr'
              : '1fr',
        },
        alignItems: backgroundImage ? 'stretch' : 'center',
        minHeight: backgroundImage ? { xs: 300, sm: 320, md: 360 } : undefined,
        bgcolor: quiz ? colors.accentQuiz : colors.blueDeep,
        color: quiz ? colors.ink : colors.paper,
        borderRadius: `${radius}px`,
        overflow: 'hidden',
        '& :focus-visible': { outlineColor: quiz ? colors.ink : colors.paper },
      }}
    >
      {backgroundImage ? (
        // La photo occupe la moitié droite du bandeau à partir de 900px, et
        // toute sa surface en dessous (le pavé de texte se pose alors en bas).
        // Cadrer ainsi évite de rogner inutilement les bannières peu hautes.
        <Box aria-hidden sx={{ position: 'absolute', inset: 0, left: { md: '56%' } }}>
          <Image
            src={backgroundImage}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 44vw"
            priority
            style={{ objectFit: 'cover', objectPosition: backgroundPosition }}
          />
        </Box>
      ) : null}

      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          // Le pavé est opaque : c'est lui qui garantit la lisibilité, la photo
          // n'est jamais recouverte.
          ...(backgroundImage
            ? {
                backgroundColor: quiz ? colors.accentQuiz : colors.blueDeep,
                alignSelf: { xs: 'end', md: 'stretch' },
              }
            : {}),
          px: { xs: 2.5, sm: 4, md: 5 },
          py: { xs: 3, md: 4.5 },
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{ fontSize: 'clamp(1.625rem, 1.2rem + 1.6vw, 2.25rem)', mb: description ? 1.5 : 0 }}
        >
          {title}
        </Typography>

        {description ? (
          <Typography
            component="p"
            sx={{
              color: quiz ? colors.ink : colors.bluePale,
              fontSize: { xs: '0.9375rem', md: '1rem' },
              maxWidth: '62ch',
              m: 0,
              opacity: quiz ? 0.85 : 1,
            }}
          >
            {description}
          </Typography>
        ) : null}

        {children}
      </Box>

      {image ? (
        <Box sx={{ position: 'relative', display: { xs: 'none', md: 'block' }, height: '100%' }}>
          <MediaImage media={image} cover sizes="40vw" sx={{ minHeight: '100%' }} />
        </Box>
      ) : null}
    </Box>
  )
}

export default PageHero
