import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import type { Payload } from 'payload'

import type { Media, Tag } from '../payload-types'
import { callout, list, p, quote, richText, type RichTextContent } from './lexical'
import { ensureThemes, type SeedTheme } from './taxonomies'
import { buildPdf } from './pdf'

/**
 * Jeu de guides de démonstration (§ 2.2) : quatre fiches publiées réparties sur
 * trois thèmes, chacune avec un encadré, et des ressources téléchargeables sur
 * la première.
 *
 * Le script est rejouable : les guides portant ces slugs sont supprimés avant
 * d'être recréés, les thèmes, tags et fichiers sont réutilisés s'ils existent.
 */

type SeedSection = {
  heading: string
  content: RichTextContent
}

type SeedResource = {
  label: string
  description?: string
  /** Clé de `RESOURCE_FILES`. */
  file: string
}

type SeedGuide = {
  slug: string
  title: string
  summary: string
  themeSlug: string
  tagSlugs: string[]
  publishedAt: string
  sections: SeedSection[]
  resources?: SeedResource[]
}

const THEMES: SeedTheme[] = [
  { slug: 'elections', name: 'Élections', color: 'blue-bright' },
  { slug: 'budget-finances', name: 'Budget & finances', color: 'blue-mid' },
  { slug: 'sante-securite', name: 'Santé & sécurité', color: 'blue-deep' },
]

const TAGS: { slug: string; name: string }[] = [
  { slug: 'mandat', name: 'Mandat' },
  { slug: 'budget', name: 'Budget' },
  { slug: 'prevention', name: 'Prévention' },
  { slug: 'procedure', name: 'Procédure' },
]

const RESOURCE_FILES: Record<string, { filename: string; title: string; lines: string[] }> = {
  protocole: {
    filename: 'modele-protocole-accord-preelectoral.pdf',
    title: 'Modele de protocole d accord preelectoral',
    lines: [
      'Entre l employeur et les organisations syndicales representatives,',
      'il est convenu ce qui suit :',
      '1. Repartition du personnel entre les colleges electoraux',
      '2. Repartition des sieges entre les colleges',
      '3. Dates, heures et lieu des scrutins',
      '4. Modalites du vote electronique le cas echeant',
      '',
      'Document de demonstration - a adapter a votre entreprise.',
    ],
  },
  calendrier: {
    filename: 'calendrier-type-elections-cse.pdf',
    title: 'Calendrier type des elections du CSE',
    lines: [
      'J-90  Information du personnel sur l organisation des elections',
      'J-75  Invitation des organisations syndicales a negocier',
      'J-45  Signature du protocole d accord preelectoral',
      'J-30  Depot des listes de candidats',
      'J-15  Affichage des listes',
      'J     Premier tour du scrutin',
      'J+15  Second tour si le quorum n est pas atteint',
      '',
      'Document de demonstration - a adapter a votre entreprise.',
    ],
  },
  tableauBudget: {
    filename: 'tableau-suivi-budgets-cse.pdf',
    title: 'Tableau de suivi des deux budgets',
    lines: [
      'Budget de fonctionnement (0,20 % ou 0,22 % de la masse salariale)',
      '  - Report de l exercice precedent',
      '  - Subvention versee par l employeur',
      '  - Depenses : formation des elus, expertise, documentation',
      '',
      'Budget des activites sociales et culturelles',
      '  - Report de l exercice precedent',
      '  - Contribution de l employeur',
      '  - Depenses : billetterie, cheques vacances, aides',
      '',
      'Document de demonstration - a adapter a votre entreprise.',
    ],
  },
}

const GUIDES: SeedGuide[] = [
  {
    slug: 'organiser-les-elections-du-cse',
    title: 'Organiser les élections du CSE',
    summary:
      'De l’information du personnel à la proclamation des résultats : le déroulé complet d’un processus électoral, les délais à respecter et les pièges à éviter.',
    themeSlug: 'elections',
    tagSlugs: ['mandat', 'procedure'],
    publishedAt: '2026-09-01T08:00:00.000Z',
    resources: [
      {
        file: 'protocole',
        label: 'Modèle de protocole d’accord préélectoral',
        description: 'Trame à compléter avec les organisations syndicales invitées à négocier.',
      },
      {
        file: 'calendrier',
        label: 'Calendrier type des élections',
        description: 'Rétroplanning sur 90 jours, du premier affichage au second tour.',
      },
    ],
    sections: [
      {
        heading: 'Quand déclencher le processus électoral',
        content: richText(
          p(
            'Les élections doivent être organisées tous les quatre ans, sauf accord d’entreprise réduisant la durée des mandats. L’employeur informe le personnel de l’organisation du scrutin au plus tard quatre-vingt-dix jours avant le premier tour.',
          ),
          list([
            'Entreprise atteignant onze salariés pendant douze mois consécutifs : mise en place obligatoire.',
            'Renouvellement : information du personnel quatre-vingt-dix jours avant la fin des mandats.',
            'Carence constatée : nouvelle tentative à la demande d’un salarié ou d’un syndicat.',
          ]),
        ),
      },
      {
        heading: 'Le protocole d’accord préélectoral',
        content: richText(
          p(
            'Le protocole fixe la répartition du personnel entre les collèges, celle des sièges, ainsi que les dates et modalités du scrutin. Il se négocie avec les organisations syndicales invitées par l’employeur.',
          ),
          callout('warning', [
            'La double condition de majorité est exigeante : le protocole doit être signé par la majorité des organisations ayant participé à la négociation, dont celles représentant la majorité des suffrages exprimés aux dernières élections. Sans elle, l’employeur ne peut pas modifier librement la répartition légale.',
          ]),
        ),
      },
      {
        heading: 'Constituer les listes de candidats',
        content: richText(
          p(
            'Au premier tour, seules les organisations syndicales peuvent présenter des listes. Chaque liste doit respecter la représentation équilibrée des femmes et des hommes, à proportion de leur part dans le collège concerné.',
          ),
          list([
            'Être électeur, âgé d’au moins dix-huit ans, et disposer d’une ancienneté d’un an.',
            'Alterner les candidats de chaque sexe jusqu’à épuisement des candidats du sexe minoritaire.',
            'Déposer les listes dans le délai fixé par le protocole.',
          ]),
        ),
      },
      {
        heading: 'Le déroulement du scrutin',
        content: richText(
          p(
            'Le vote a lieu pendant le temps de travail, à bulletin secret et sous enveloppe, ou par voie électronique si un accord le prévoit. Deux scrutins distincts sont organisés : titulaires puis suppléants.',
          ),
          p(
            'Si le quorum — la moitié des électeurs inscrits — n’est pas atteint au premier tour, un second tour est organisé dans les quinze jours ; les candidatures libres y sont recevables.',
          ),
        ),
      },
      {
        heading: 'Après la proclamation des résultats',
        content: richText(
          p(
            'Le procès-verbal est transmis dans les quinze jours à l’inspection du travail et au centre de traitement des élections professionnelles. Les élus entrent en fonction immédiatement.',
          ),
          quote(
            'Le premier réflexe utile après une élection : fixer la date de la réunion constitutive et désigner le secrétaire et le trésorier.',
          ),
        ),
      },
    ],
  },
  {
    slug: 'maitriser-les-deux-budgets-du-cse',
    title: 'Maîtriser les deux budgets du CSE',
    summary:
      'Budget de fonctionnement et budget des activités sociales : à quoi sert chacun, ce qu’ils financent, et ce que le CSE peut transférer de l’un à l’autre.',
    themeSlug: 'budget-finances',
    tagSlugs: ['budget', 'mandat'],
    publishedAt: '2026-09-05T08:00:00.000Z',
    resources: [
      {
        file: 'tableauBudget',
        label: 'Tableau de suivi des deux budgets',
        description: 'Trame de suivi annuel, report de l’exercice précédent inclus.',
      },
    ],
    sections: [
      {
        heading: 'Deux budgets, deux usages',
        content: richText(
          p(
            'Le CSE dispose de deux enveloppes strictement distinctes. Le budget de fonctionnement couvre son activité propre ; le budget des activités sociales et culturelles bénéficie aux salariés et à leur famille.',
          ),
          callout('keyPoint', [
            'Confondre les deux budgets est la première source de contentieux comptable dans les CSE. Un compte bancaire par budget, et une ligne par dépense : c’est la seule discipline qui protège les élus.',
          ]),
        ),
      },
      {
        heading: 'Le budget de fonctionnement',
        content: richText(
          p(
            'Il est versé par l’employeur à hauteur de 0,20 % de la masse salariale brute dans les entreprises de cinquante à deux mille salariés, et de 0,22 % au-delà.',
          ),
          list([
            'Formation économique des élus et formation des représentants de proximité.',
            'Recours à un expert-comptable ou à un avocat pour les besoins du comité.',
            'Abonnements, documentation juridique, frais de déplacement liés au mandat.',
          ]),
        ),
      },
      {
        heading: 'Le budget des activités sociales et culturelles',
        content: richText(
          p(
            'Aucun montant légal minimal : la contribution est calculée sur la base des sommes versées l’année précédente, sauf accord plus favorable. Le CSE décide seul de son affectation, dans le respect du principe de non-discrimination.',
          ),
          p(
            'Les critères d’attribution doivent rester objectifs. Un avantage réservé aux salariés ayant une certaine ancienneté est admis ; un avantage réservé aux seuls syndiqués ne l’est pas.',
          ),
        ),
      },
      {
        heading: 'Transferts et reliquats',
        content: richText(
          p(
            'En fin d’exercice, le CSE peut transférer jusqu’à 10 % de l’excédent d’un budget vers l’autre. La décision se prend en séance et figure au procès-verbal ainsi que dans les comptes annuels.',
          ),
          list([
            'Transfert du fonctionnement vers les activités sociales : plafonné à 10 % de l’excédent.',
            'Transfert inverse : possible dans la même limite.',
            'Mention obligatoire dans le rapport d’activité et de gestion.',
          ]),
        ),
      },
    ],
  },
  {
    slug: 'le-cse-face-aux-risques-professionnels',
    title: 'Le CSE face aux risques professionnels',
    summary:
      'Document unique, visites d’inspection, droit d’alerte : les leviers concrets dont disposent les élus pour agir sur la santé et la sécurité au travail.',
    themeSlug: 'sante-securite',
    tagSlugs: ['prevention', 'mandat'],
    publishedAt: '2026-09-10T08:00:00.000Z',
    sections: [
      {
        heading: 'Le document unique d’évaluation des risques',
        content: richText(
          p(
            'Le document unique recense les risques par unité de travail et les mesures de prévention associées. Le CSE est consulté sur sa mise à jour, au moins annuelle dans les entreprises d’au moins onze salariés.',
          ),
          callout('info', [
            'Le document unique doit être mis à la disposition des élus à tout moment. Un refus de communication est un délit d’entrave : demandez-le par écrit, en séance, et faites acter la demande au procès-verbal.',
          ]),
        ),
      },
      {
        heading: 'Les inspections et visites de site',
        content: richText(
          p(
            'Le CSE procède à intervalles réguliers à des inspections en matière de santé, de sécurité et de conditions de travail. Dans les entreprises d’au moins trois cents salariés, une commission dédiée en assure le suivi.',
          ),
          list([
            'Quatre réunions annuelles au minimum portent en tout ou partie sur ces sujets.',
            'L’inspection du travail et le service de prévention sont invités à ces réunions.',
            'Les observations sont consignées et suivies d’un plan d’action daté.',
          ]),
        ),
      },
      {
        heading: 'Le droit d’alerte en cas de danger grave et imminent',
        content: richText(
          p(
            'Tout élu qui constate un danger grave et imminent en alerte immédiatement l’employeur et consigne son alerte sur un registre spécial. Une enquête est menée sans délai, conjointement avec l’employeur.',
          ),
          p(
            'En cas de désaccord sur la réalité du danger ou sur les mesures à prendre, l’inspection du travail est saisie et le CSE est réuni dans les vingt-quatre heures.',
          ),
        ),
      },
      {
        heading: 'Le recours à un expert',
        content: richText(
          p(
            'Le CSE peut faire appel à un expert habilité en cas de risque grave identifié dans l’établissement, ou à l’occasion d’un projet important modifiant les conditions de santé et de sécurité.',
          ),
          quote(
            'L’expertise n’est pas une défiance : c’est un moyen de mettre des faits mesurés au centre d’une discussion souvent tendue.',
          ),
        ),
      },
    ],
  },
  {
    slug: 'mener-une-enquete-apres-un-accident-du-travail',
    title: 'Mener une enquête après un accident du travail',
    summary:
      'Qui participe, quelles questions poser, quoi écrire : une méthode d’enquête utilisable dès les premières heures après un accident.',
    themeSlug: 'sante-securite',
    tagSlugs: ['prevention', 'procedure'],
    publishedAt: '2026-09-15T08:00:00.000Z',
    sections: [
      {
        heading: 'Constituer la délégation d’enquête',
        content: richText(
          p(
            'L’enquête est menée conjointement par l’employeur ou son représentant et par un membre de la délégation du personnel au CSE. Le temps passé n’est pas déduit des heures de délégation.',
          ),
          list([
            'Se déplacer sur les lieux avant toute remise en état, si la sécurité le permet.',
            'Recueillir les témoignages au plus près de l’événement.',
            'Photographier et dater l’état des installations.',
          ]),
        ),
      },
      {
        heading: 'Remonter aux causes, pas aux responsables',
        content: richText(
          p(
            'L’objet de l’enquête est la prévention, pas la sanction. La méthode de l’arbre des causes permet de remonter des faits constatés aux facteurs organisationnels sans chercher de coupable.',
          ),
          callout('warning', [
            'Une enquête qui conclut à une « erreur du salarié » s’arrête trop tôt. Demandez systématiquement ce qui a rendu cette erreur possible : cadence, formation, équipement, consigne contradictoire.',
          ]),
        ),
      },
      {
        heading: 'Formaliser et suivre les suites',
        content: richText(
          p(
            'Le rapport d’enquête est présenté en séance et annexé au procès-verbal. Chaque mesure de prévention retenue est assortie d’un responsable et d’une échéance, puis inscrite à l’ordre du jour d’une réunion ultérieure pour vérification.',
          ),
          p(
            'Le document unique est mis à jour dès lors que l’enquête révèle un risque non recensé ou sous-évalué.',
          ),
        ),
      },
    ],
  },
]

const ensureTags = async (payload: Payload): Promise<Map<string, number>> => {
  const map = new Map<string, number>()

  for (const tag of TAGS) {
    const { docs } = await payload.find({
      collection: 'tags',
      where: { slug: { equals: tag.slug } },
      limit: 1,
      depth: 0,
    })

    const existing = docs[0] as Tag | undefined
    if (existing) {
      map.set(tag.slug, existing.id)
      continue
    }

    const created = await payload.create({
      collection: 'tags',
      data: { name: tag.name, slug: tag.slug },
    })
    map.set(tag.slug, created.id)
  }

  return map
}

/** Écrit les PDF de démonstration sur disque et les téléverse dans `media`. */
const ensureResourceFiles = async (payload: Payload): Promise<Map<string, number>> => {
  const map = new Map<string, number>()
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'infos-elus-seed-'))

  try {
    for (const [key, file] of Object.entries(RESOURCE_FILES)) {
      const { docs } = await payload.find({
        collection: 'media',
        where: { filename: { equals: file.filename } },
        limit: 1,
        depth: 0,
      })

      const existing = docs[0] as Media | undefined
      if (existing) {
        map.set(key, existing.id)
        continue
      }

      const filePath = path.join(directory, file.filename)
      await fs.writeFile(filePath, buildPdf(file.title, file.lines))

      const created = await payload.create({
        collection: 'media',
        data: { alt: file.title },
        filePath,
      })
      payload.logger.info(`Ressource téléversée : ${file.filename}`)
      map.set(key, created.id)
    }
  } finally {
    await fs.rm(directory, { recursive: true, force: true })
  }

  return map
}

export async function seedGuides(payload: Payload): Promise<void> {
  const [themes, tags, files] = [
    await ensureThemes(payload, THEMES),
    await ensureTags(payload),
    await ensureResourceFiles(payload),
  ]

  // Rejouable : on repart d'une ardoise propre pour ces slugs uniquement.
  const slugs = GUIDES.map((guide) => guide.slug)
  const { docs: existing } = await payload.find({
    collection: 'guides',
    where: { slug: { in: slugs } },
    limit: slugs.length,
    depth: 0,
  })

  if (existing.length > 0) {
    await payload.delete({
      collection: 'guides',
      where: { slug: { in: slugs } },
      context: { disableRevalidate: true },
    })
    payload.logger.info(`${existing.length} guide(s) de démonstration remplacé(s)`)
  }

  for (const guide of GUIDES) {
    const themeId = themes.get(guide.themeSlug)
    if (!themeId) throw new Error(`Thème introuvable pour le guide « ${guide.title} »`)

    await payload.create({
      collection: 'guides',
      context: { disableRevalidate: true },
      data: {
        title: guide.title,
        slug: guide.slug,
        summary: guide.summary,
        theme: themeId,
        tags: guide.tagSlugs
          .map((slug) => tags.get(slug))
          .filter((id): id is number => typeof id === 'number'),
        sections: guide.sections.map((section) => ({
          heading: section.heading,
          content: section.content,
        })),
        resources: (guide.resources ?? []).map((resource) => {
          const fileId = files.get(resource.file)
          if (!fileId) throw new Error(`Fichier introuvable : ${resource.file}`)

          return {
            label: resource.label,
            description: resource.description,
            file: fileId,
          }
        }),
        publishedAt: guide.publishedAt,
        _status: 'published',
      },
    })

    payload.logger.info(`Guide publié : ${guide.title}`)
  }
}
