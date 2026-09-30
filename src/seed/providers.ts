import type { Payload } from 'payload'

import type { Provider } from '../payload-types'
import { heading, list, p, quote, richText, type RichTextContent } from './lexical'

/**
 * Annuaire de démonstration (§ 2.4) : dix prestataires fictifs répartis sur les
 * cinq catégories, avec des zones d'intervention variées.
 *
 * Deux fiches restent décochées pour donner à voir la modération : elles
 * apparaissent dans l'admin, jamais sur le site public.
 *
 * Le script est rejouable : les fiches portant ces slugs sont supprimées avant
 * d'être recréées.
 */

type SeedProvider = {
  slug: string
  name: string
  category: Provider['category']
  shortDescription: string
  interventionAreas: NonNullable<Provider['interventionAreas']>
  contact: NonNullable<Provider['contact']>
  description?: RichTextContent
  published?: boolean
}

const PROVIDERS: SeedProvider[] = [
  {
    slug: 'atelier-mandat',
    name: 'Atelier Mandat',
    category: 'training',
    shortDescription:
      'Formations économiques et SSCT pour les élus nouvellement mandatés, en présentiel ou à distance.',
    interventionAreas: ['france'],
    contact: {
      contactName: 'Nadia Belkacem',
      email: 'contact@atelier-mandat.example',
      phone: '01 23 45 67 89',
      website: 'https://atelier-mandat.example',
    },
    description: richText(
      p(
        'Atelier Mandat accompagne les élus dès leur prise de fonction : comprendre le budget, lire un bilan, préparer une réunion et savoir quoi demander à l’employeur.',
      ),
      heading('h3', 'Nos formats'),
      list([
        'Formation économique de cinq jours, agréée, en intra ou en inter-entreprises',
        'Formation SSCT de trois à cinq jours selon l’effectif',
        'Ateliers courts d’une demi-journée sur un thème précis',
      ]),
      heading('h3', 'Notre approche'),
      p(
        'Les sessions partent de vos ordres du jour et de vos documents réels plutôt que de cas d’école. Chaque participant repart avec ses propres modèles de courrier et de délibération.',
      ),
      quote(
        'Une formation utile est une formation dont on se sert dès la réunion suivante.',
      ),
    ),
    published: true,
  },
  {
    slug: 'cap-formation-elus',
    name: 'Cap Formation Élus',
    category: 'training',
    shortDescription:
      'Organisme de formation dédié aux CSE de moins de cinquante salariés, avec des sessions en petit groupe.',
    interventionAreas: ['ile-de-france', 'hauts-de-france', 'grand-est'],
    contact: {
      email: 'inscriptions@cap-formation-elus.example',
      phone: '03 20 11 22 33',
      website: 'https://cap-formation-elus.example',
    },
    description: richText(
      p(
        'Cap Formation Élus réunit huit participants au maximum par session, pour que chacun puisse exposer la situation de son entreprise.',
      ),
      heading('h3', 'Thèmes couverts'),
      list([
        'Rôle et attributions du CSE dans les entreprises de 11 à 49 salariés',
        'Réclamations individuelles et collectives : comment les formuler',
        'Santé, sécurité et conditions de travail au quotidien',
      ]),
    ),
    published: true,
  },
  {
    slug: 'cabinet-vergne-loiseau',
    name: 'Cabinet Vergne & Loiseau',
    category: 'legal',
    shortDescription:
      'Avocats en droit du travail, aux côtés des élus sur les consultations, les expertises et le contentieux.',
    interventionAreas: ['france'],
    contact: {
      contactName: 'Maître Hélène Vergne',
      email: 'cse@vergne-loiseau.example',
      phone: '01 44 55 66 77',
      website: 'https://vergne-loiseau.example',
    },
    description: richText(
      p(
        'Le cabinet n’intervient que du côté des représentants du personnel. Il accompagne les CSE sur les procédures d’information-consultation, les projets de réorganisation et les litiges liés au fonctionnement de l’instance.',
      ),
      heading('h3', 'Interventions courantes'),
      list([
        'Analyse d’un projet soumis à consultation et rédaction de l’avis',
        'Recours en cas de délai de consultation manifestement insuffisant',
        'Assistance lors d’une enquête pour harcèlement ou pour danger grave et imminent',
      ]),
      p(
        'Une première prise de contact téléphonique permet de qualifier la demande avant tout engagement.',
      ),
    ),
    published: true,
  },
  {
    slug: 'juris-cse-conseil',
    name: 'Juris CSE Conseil',
    category: 'legal',
    shortDescription:
      'Permanence juridique par téléphone et par email, avec une réponse écrite sous quarante-huit heures.',
    interventionAreas: ['occitanie', 'nouvelle-aquitaine'],
    contact: {
      email: 'permanence@juris-cse-conseil.example',
      phone: '05 61 00 00 00',
      website: 'https://juris-cse-conseil.example',
    },
    description: richText(
      p(
        'Une permanence à l’année pour les questions qui ne justifient pas de saisir un avocat, mais qui méritent mieux qu’une recherche improvisée la veille de la réunion.',
      ),
    ),
    // Fiche en attente de validation : elle n'apparaît pas sur le site.
    published: false,
  },
  {
    slug: 'chiffre-et-mandat',
    name: 'Chiffre & Mandat',
    category: 'accounting',
    shortDescription:
      'Tenue des comptes du CSE, établissement des comptes annuels et présentation en réunion plénière.',
    interventionAreas: ['france'],
    contact: {
      contactName: 'Pierre Anselme',
      email: 'bonjour@chiffre-et-mandat.example',
      phone: '02 40 12 34 56',
      website: 'https://chiffre-et-mandat.example',
    },
    description: richText(
      p(
        'Chiffre & Mandat prend en charge la comptabilité du comité, de la saisie courante jusqu’au rapport annuel d’activité et de gestion.',
      ),
      heading('h3', 'Ce qui est inclus'),
      list([
        'Séparation stricte du budget de fonctionnement et du budget des activités sociales',
        'Comptes annuels adaptés à la taille du comité',
        'Présentation commentée des comptes lors de la réunion d’approbation',
      ]),
      p(
        'Les obligations comptables varient selon les ressources du comité : un point de cadrage gratuit permet de savoir ce qui vous incombe.',
      ),
    ),
    published: true,
  },
  {
    slug: 'audit-boreal',
    name: 'Audit Boréal',
    category: 'accounting',
    shortDescription:
      'Expertise-comptable agréée CSE : examen des comptes de l’entreprise et des orientations stratégiques.',
    interventionAreas: ['auvergne-rhone-alpes', 'bourgogne-franche-comte'],
    contact: {
      email: 'contact@audit-boreal.example',
      phone: '04 72 00 11 22',
      website: 'https://audit-boreal.example',
    },
    description: richText(
      p(
        'Audit Boréal réalise les expertises financées par l’employeur : politique sociale, situation économique et financière, orientations stratégiques.',
      ),
      heading('h3', 'Déroulé d’une expertise'),
      list(
        [
          'Délibération du CSE désignant l’expert',
          'Demande de documents et entretiens avec la direction',
          'Rapport écrit remis quinze jours avant la réunion',
          'Restitution orale devant les élus',
        ],
        true,
      ),
    ),
    published: true,
  },
  {
    slug: 'billetterie-farandole',
    name: 'Billetterie Farandole',
    category: 'ticketing',
    shortDescription:
      'Plateforme de billetterie et de chèques cadeaux, sans abonnement ni engagement de volume.',
    interventionAreas: ['france'],
    contact: {
      contactName: 'Sofia Renard',
      email: 'cse@farandole-billetterie.example',
      website: 'https://farandole-billetterie.example',
    },
    description: richText(
      p(
        'Cinéma, parcs, spectacles et séjours, réservés directement par les salariés depuis un espace aux couleurs du comité.',
      ),
      heading('h3', 'Fonctionnement'),
      list([
        'Le comité fixe librement sa participation, globale ou par famille de prestations',
        'Les salariés paient leur part en ligne, le comité règle la sienne mensuellement',
        'Un export comptable mensuel reprend la répartition par bénéficiaire',
      ]),
      p(
        'Les plafonds d’exonération URSSAF évoluant chaque année, le tableau de suivi signale les dépassements avant qu’ils ne soient acquis.',
      ),
    ),
    published: true,
  },
  {
    slug: 'comptoir-des-asc',
    name: 'Comptoir des ASC',
    category: 'ticketing',
    shortDescription:
      'Catalogue d’activités sociales et culturelles construit avec des partenaires locaux du Grand Ouest.',
    interventionAreas: ['bretagne', 'pays-de-la-loire', 'normandie'],
    contact: {
      email: 'contact@comptoir-asc.example',
      phone: '02 99 00 00 00',
    },
    description: richText(
      p(
        'Une sélection courte et assumée : des sorties, des ateliers et des séjours proposés par des structures de la région plutôt qu’un catalogue national.',
      ),
    ),
    // Fiche en attente de validation : elle n'apparaît pas sur le site.
    published: false,
  },
  {
    slug: 'les-rendez-vous-du-mandat',
    name: 'Les Rendez-vous du Mandat',
    category: 'events',
    shortDescription:
      'Organisation d’assemblées générales, de journées d’accueil et d’arbres de Noël pour les comités.',
    interventionAreas: ['ile-de-france', 'centre-val-de-loire'],
    contact: {
      contactName: 'Marc Toussaint',
      email: 'projets@rdv-du-mandat.example',
      phone: '01 30 00 00 00',
      website: 'https://rdv-du-mandat.example',
    },
    description: richText(
      p(
        'De la recherche de lieu à la logistique du jour J, l’équipe prend en charge les événements du comité et laisse aux élus le soin du contenu.',
      ),
      heading('h3', 'Types d’événements'),
      list([
        'Assemblée générale annuelle et réunion d’information des salariés',
        'Journée d’accueil des nouveaux élus après un renouvellement',
        'Arbre de Noël, de la commande des cadeaux à l’accueil des familles',
      ]),
    ),
    published: true,
  },
  {
    slug: 'escale-evenements',
    name: 'Escale Événements',
    category: 'events',
    shortDescription:
      'Séjours collectifs et week-ends de cohésion, avec une attention portée à l’accessibilité des sites.',
    interventionAreas: ['provence-alpes-cote-d-azur', 'corse'],
    contact: {
      email: 'sejours@escale-evenements.example',
      phone: '04 91 00 00 00',
      website: 'https://escale-evenements.example',
    },
    description: richText(
      p(
        'Escale Événements conçoit des séjours pour vingt à deux cents personnes et vérifie l’accessibilité de chaque lieu avant de le proposer.',
      ),
      quote(
        'Un séjour réussi est un séjour où personne n’a été laissé au pied du car.',
      ),
    ),
    published: true,
  },
]

export async function seedProviders(payload: Payload): Promise<void> {
  const slugs = PROVIDERS.map((provider) => provider.slug)

  const { docs: existing } = await payload.find({
    collection: 'providers',
    where: { slug: { in: slugs } },
    limit: slugs.length,
    depth: 0,
  })

  if (existing.length > 0) {
    await payload.delete({
      collection: 'providers',
      where: { slug: { in: slugs } },
      context: { disableRevalidate: true },
    })
    payload.logger.info(`${existing.length} prestataire(s) de démonstration remplacé(s)`)
  }

  for (const provider of PROVIDERS) {
    await payload.create({
      collection: 'providers',
      context: { disableRevalidate: true },
      data: {
        name: provider.name,
        slug: provider.slug,
        shortDescription: provider.shortDescription,
        description: provider.description,
        category: provider.category,
        interventionAreas: provider.interventionAreas,
        contact: provider.contact,
        published: provider.published ?? false,
      },
    })
  }

  payload.logger.info(`${PROVIDERS.length} prestataires de démonstration créés`)
}
