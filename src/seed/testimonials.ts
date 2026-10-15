import type { Payload } from 'payload'

/**
 * Paroles d'élus de démonstration (§ 2.6) : quatre citations publiées, qui
 * tournent d'une semaine sur l'autre à côté du bloc newsletter de l'accueil, et
 * une cinquième laissée en brouillon pour donner à voir la relecture — elle
 * apparaît dans l'admin, jamais sur le site.
 *
 * Les citations sont volontairement distinctes de celles de
 * `tests/manual/jeu-de-donnee-exemple.md` : les deux jeux peuvent coexister.
 *
 * Le script est rejouable : les témoignages portant ces citations sont
 * supprimés avant d'être recréés.
 */

type SeedTestimonial = {
  quote: string
  author?: string
  role?: string
  draft?: boolean
}

const TESTIMONIALS: SeedTestimonial[] = [
  {
    quote:
      'Avant, je découvrais les documents en séance. Maintenant je les demande par écrit huit jours avant, et la réunion sert enfin à discuter.',
    author: 'Karim D.',
    role: 'Secrétaire de CSE, 320 salariés',
  },
  {
    quote:
      'Nous avons voté notre premier budget sans savoir ce qui relevait du fonctionnement ou des activités sociales. La fiche sur les deux budgets nous a évité de recommencer.',
    author: 'Sylvie M.',
    role: 'Trésorière de CSE, 140 salariés',
  },
  {
    quote:
      'Un mandat, c’est beaucoup de questions qu’on n’ose pas poser à la direction. Lire comment d’autres élus les ont posées change tout.',
    author: 'Un élu de CSE',
    role: 'Élu titulaire, 60 salariés',
  },
  {
    quote:
      'La veille du lundi matin est devenue notre point d’ordre du jour : on repère ce qui bouge, et on décide si ça concerne notre entreprise.',
    author: 'Hélène P.',
    role: 'Présidente de la commission SSCT, 450 salariés',
  },
  {
    quote:
      'Témoignage en cours de relecture : il reste à vérifier le mandat et l’accord de l’élue avant publication.',
    author: 'Brouillon de démonstration',
    draft: true,
  },
]

export async function seedTestimonials(payload: Payload): Promise<void> {
  // La collection n'a pas de slug : la citation fait office d'identité, c'est
  // aussi elle qui titre les documents dans l'admin (`useAsTitle`).
  const quotes = TESTIMONIALS.map((testimonial) => testimonial.quote)

  const { docs: existing } = await payload.find({
    collection: 'testimonials',
    where: { quote: { in: quotes } },
    limit: quotes.length,
    depth: 0,
  })

  if (existing.length > 0) {
    await payload.delete({
      collection: 'testimonials',
      where: { quote: { in: quotes } },
      context: { disableRevalidate: true },
    })
    payload.logger.info(`${existing.length} témoignage(s) de démonstration remplacé(s)`)
  }

  for (const testimonial of TESTIMONIALS) {
    await payload.create({
      collection: 'testimonials',
      context: { disableRevalidate: true },
      data: {
        quote: testimonial.quote,
        author: testimonial.author,
        role: testimonial.role,
        _status: testimonial.draft ? 'draft' : 'published',
      },
    })
  }

  payload.logger.info(`${TESTIMONIALS.length} témoignages de démonstration créés`)
}
