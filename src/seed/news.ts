import path from 'path'
import type { Payload } from 'payload'

import type { Media } from '../payload-types'
import { callout, heading, list, p, quote, richText, type RichTextContent } from './lexical'
import { ensureCategories, ensureTags } from './taxonomies'

/**
 * Jeu d'actualités de démonstration (§ 2.3) : six documents publiés de la
 * collection Articles dont le champ `type` vaut `news`, dont un coché « Grand
 * format ». L'actualité n'est pas une collection à part.
 *
 * Les textes sont fictifs. Ils imitent le registre et la longueur d'une brève
 * juridique destinée aux élus, mais n'ont aucune valeur juridique : ni les
 * décisions ni les textes réglementaires cités n'existent.
 *
 * Le script est rejouable : les actualités portant ces slugs sont supprimées
 * avant d'être recréées, les catégories, tags et images sont réutilisés.
 */

type SeedNews = {
  slug: string
  title: string
  excerpt: string
  categorySlug: string
  tagSlugs: string[]
  publishedAt: string
  /** Clé de `IMAGES`. Omise, l'actualité s'affiche sans vignette. */
  image?: string
  /** Une seule actualité ouvre le fil en grand format. */
  featured?: boolean
  content: RichTextContent
}

/**
 * Visuels repris des bandeaux de rubrique du dépôt : ce sont les seules
 * photographies versionnées, donc les seules dont le seed dispose sur une base
 * neuve. À remplacer par de vraies images éditoriales.
 */
const IMAGES: Record<string, { source: string; alt: string }> = {
  comptabilite: {
    source: 'public/images/articles.jpeg',
    alt: 'Documents de comptabilité du CSE, calculatrice et lunettes posés sur un bureau',
  },
  ouvrages: {
    source: 'public/images/guides.jpeg',
    alt: 'Pile d’ouvrages juridiques reliés, lunettes et stylo posés sur un bureau en bois',
  },
}

const NEWS: SeedNews[] = [
  {
    slug: 'contestation-des-elections-du-cse-le-juge-resserre-les-delais',
    title: 'Contestation des élections du CSE : le juge resserre les délais de recevabilité',
    excerpt:
      'Le délai de quinze jours court à compter de la proclamation publique des résultats, et non de la réception du procès-verbal par chaque organisation syndicale. Une précision qui raccourcit la fenêtre d’action des élus.',
    categorySlug: 'elections',
    tagSlugs: ['procedure', 'mandat'],
    publishedAt: '2026-10-06T06:30:00.000Z',
    image: 'ouvrages',
    content: richText(
      p(
        'La chambre sociale apporte une précision attendue sur le point de départ du délai de contestation des élections professionnelles. Saisie par une organisation syndicale qui n’avait pas reçu le procès-verbal du second tour, elle juge que le délai de quinze jours court à compter de la proclamation publique des résultats, et non de la date à laquelle chaque organisation a effectivement reçu le document.',
      ),
      p(
        'La solution n’est pas inédite dans son principe, mais elle était régulièrement contournée devant les tribunaux judiciaires : plusieurs juges du fond retenaient la date de transmission effective, au motif qu’une organisation ne peut contester ce qu’elle ignore. L’arrêt referme la discussion et rétablit un point de départ unique, identique pour tous les acteurs du scrutin.',
      ),
      heading('h2', 'Un point de départ unique pour tous les acteurs'),
      p(
        'L’argument retenu tient à la sécurité juridique du scrutin. Faire courir le délai à compter d’une notification individuelle revenait à ouvrir autant de fenêtres de contestation qu’il y avait d’organisations, et à laisser planer l’incertitude sur la composition du comité pendant plusieurs semaines après le vote. La proclamation, elle, est un événement public, daté et opposable à tous.',
      ),
      p(
        'La Cour prend soin de préciser que l’absence de transmission du procès-verbal n’est pas sans conséquence : elle constitue un manquement de l’employeur, susceptible d’être sanctionné comme tel. Mais ce manquement ne proroge pas le délai de contestation. Les deux questions sont distinctes et ne se compensent pas.',
      ),
      heading('h2', 'Ce que les élus doivent en retenir'),
      p(
        'En pratique, la vigilance se déplace vers les heures qui suivent immédiatement le dépouillement. Les organisations qui envisagent une contestation ont intérêt à acter la date de proclamation dès la séance, et à ne pas attendre la circulation du procès-verbal pour instruire leur dossier.',
      ),
      list([
        'Faire mentionner au procès-verbal l’heure exacte de la proclamation des résultats.',
        'Demander une copie du procès-verbal le jour même, sans en faire une condition préalable à la saisine.',
        'Instruire les irrégularités constatées pendant le scrutin au fil de l’eau, et non après coup.',
        'Saisir le tribunal judiciaire dans les quinze jours, quitte à compléter l’argumentaire ensuite.',
      ]),
      p(
        'Pour les employeurs, la décision n’est pas un blanc-seing. Un retard systématique dans la transmission des procès-verbaux reste un indice de déloyauté dans l’organisation du scrutin, que le juge peut retenir au fond lorsqu’il examine la régularité des opérations électorales.',
      ),
    ),
  },
  {
    slug: 'cheques-cadeaux-l-urssaf-actualise-son-bareme-de-tolerance',
    title: 'Chèques-cadeaux : l’URSSAF actualise son barème de tolérance pour les ASC',
    excerpt:
      'Le plafond d’exonération par salarié et par an est revalorisé et la liste des événements ouvrant droit à un bon d’achat exonéré est précisée. Ce que les élus doivent ajuster avant les fêtes de fin d’année.',
    categorySlug: 'budget',
    tagSlugs: ['budget', 'procedure'],
    publishedAt: '2026-10-01T07:00:00.000Z',
    image: 'comptabilite',
    featured: true,
    content: richText(
      p(
        'C’est l’une des questions les plus fréquemment posées aux élus en fin d’année : jusqu’à quel montant un chèque-cadeau échappe-t-il aux cotisations sociales ? La doctrine administrative vient d’être actualisée, avec deux changements qui méritent d’être intégrés avant la campagne de Noël.',
      ),
      heading('h2', 'Un plafond revalorisé'),
      p(
        'Le seuil de tolérance par salarié et par année civile est relevé, et son mode de calcul reste indexé sur le plafond mensuel de la sécurité sociale. Tant que le total des bons d’achat attribués à un même salarié reste sous ce seuil, l’exonération est acquise sans autre condition : ni justificatif d’événement, ni fléchage de la dépense.',
      ),
      p(
        'Au-delà, le raisonnement change complètement. L’exonération n’est plus automatique mais conditionnée, bon par bon, au respect simultané de trois critères : l’attribution doit se rattacher à un événement limitativement énuméré, le bon doit mentionner la nature du bien ou le rayon concerné, et son montant doit rester proportionné à l’événement.',
      ),
      heading('h2', 'La liste des événements précisée'),
      p(
        'Second apport : la liste des événements ouvrant droit à exonération au-delà du seuil est clarifiée sur deux points qui donnaient lieu à redressement. La rentrée scolaire est désormais explicitement rattachée à l’enfant, et non au salarié : un parent de trois enfants scolarisés ouvre trois droits distincts. Le départ à la retraite, lui, est confirmé comme événement éligible, y compris lorsqu’il intervient en cours d’année.',
      ),
      callout('keyPoint', [
        'Le seuil s’apprécie par salarié et par année civile, tous bons confondus — y compris ceux attribués par l’employeur en dehors du CSE. Un comité qui ignore les attributions patronales peut faire basculer l’ensemble dans l’assiette des cotisations sans le savoir.',
      ]),
      heading('h2', 'Mettre à jour la délibération'),
      p(
        'Les comités qui ont inscrit un montant en valeur absolue dans leur règlement des activités sociales et culturelles ont intérêt à le réécrire par renvoi au plafond en vigueur. La formulation évite d’avoir à délibérer chaque année et supprime le risque d’un règlement qui, à la lettre, se révélerait moins favorable que la tolérance applicable.',
      ),
      p(
        'Il reste à documenter l’attribution. Une liste nominative, la date, le montant et l’événement rattaché suffisent à répondre à un contrôle. C’est en général l’absence de traçabilité, plus que le dépassement du seuil, qui transforme un contrôle de routine en redressement.',
      ),
    ),
  },
  {
    slug: 'fortes-chaleurs-consultation-du-cse-sur-le-plan-d-action',
    title: 'Fortes chaleurs : le CSE doit désormais être consulté sur le plan d’action',
    excerpt:
      'Un décret impose aux entreprises de formaliser un plan d’action « épisodes de chaleur intense » et de le soumettre au comité. Le texte fixe des obligations concrètes, du point d’eau à l’aménagement des horaires.',
    categorySlug: 'sante-securite-au-travail',
    tagSlugs: ['prevention', 'procedure'],
    publishedAt: '2026-09-24T06:00:00.000Z',
    image: 'ouvrages',
    content: richText(
      p(
        'Après trois étés marqués par des alertes à répétition, la prévention des fortes chaleurs quitte le registre de la recommandation pour entrer dans celui de l’obligation. Un décret impose aux employeurs de formaliser un plan d’action spécifique et de le soumettre à la consultation du comité social et économique.',
      ),
      heading('h2', 'Un plan d’action écrit, pas une note de service'),
      p(
        'Le texte ne se contente pas d’un rappel de vigilance. Il exige un document distinct, articulé au document unique d’évaluation des risques professionnels, identifiant les postes exposés et les mesures retenues pour chaque niveau d’alerte. L’exposition ne se limite pas aux activités extérieures : les ateliers sans climatisation, les cuisines, les entrepôts sous bardage métallique et les véhicules de livraison sont expressément visés.',
      ),
      p(
        'Trois niveaux sont distingués, calés sur les alertes de l’institut national de veille. À chacun correspond un socle de mesures, de la mise à disposition d’eau fraîche à proximité immédiate des postes jusqu’à la suspension temporaire des travaux les plus pénibles aux heures les plus chaudes.',
      ),
      callout('warning', [
        'L’aménagement des horaires ne peut pas être décidé unilatéralement au motif de l’urgence. Lorsqu’il modifie la répartition du temps de travail, il relève des attributions consultatives du comité et, selon les cas, de la négociation collective.',
      ]),
      heading('h2', 'Le rôle du comité'),
      p(
        'La consultation porte sur le plan lui-même, en amont de la saison, et non sur chaque déclenchement d’alerte. C’est une différence importante : le comité se prononce sur un dispositif, pas sur une mesure ponctuelle prise dans l’urgence. Les élus ont donc intérêt à obtenir le document suffisamment tôt pour l’examiner sérieusement.',
      ),
      list([
        'Vérifier que le recensement des postes exposés correspond à la réalité du terrain.',
        'Contrôler l’accessibilité effective des points d’eau, distance et temps de trajet compris.',
        'Demander le détail des mesures prévues pour les intérimaires et les sous-traitants présents sur site.',
        'Faire inscrire au procès-verbal les écarts constatés entre le plan annoncé et les pratiques observées.',
      ]),
      p(
        'Le texte confirme par ailleurs que le droit d’alerte pour danger grave et imminent trouve pleinement à s’appliquer en cas d’exposition à la chaleur. Un élu qui constate un poste non protégé lors d’une alerte de niveau élevé n’a pas à attendre la prochaine réunion ordinaire pour agir.',
      ),
    ),
  },
  {
    slug: 'nao-la-reforme-du-calendrier-de-negociation-entre-en-vigueur',
    title: 'NAO : la réforme du calendrier de négociation entre en vigueur',
    excerpt:
      'La périodicité des négociations obligatoires peut désormais être aménagée par accord jusqu’à quatre ans, à condition de prévoir une clause de revoyure. Les élus y gagnent un rendez-vous intermédiaire garanti.',
    categorySlug: 'negociation',
    tagSlugs: ['mandat', 'procedure'],
    publishedAt: '2026-09-17T06:45:00.000Z',
    image: 'comptabilite',
    content: richText(
      p(
        'La réforme du calendrier des négociations obligatoires est entrée en vigueur. Elle assouplit la périodicité des rendez-vous annuels tout en introduisant une contrepartie que les organisations syndicales réclamaient depuis plusieurs cycles : une clause de revoyure obligatoire dès lors que la périodicité dépasse deux ans.',
      ),
      heading('h2', 'Jusqu’à quatre ans, sous conditions'),
      p(
        'Le principe reste la négociation annuelle sur les salaires, le temps de travail et le partage de la valeur ajoutée. Un accord majoritaire peut y déroger et porter la périodicité jusqu’à quatre ans, contre trois auparavant. Mais l’allongement n’est plus libre : au-delà de deux ans, l’accord doit prévoir les conditions dans lesquelles la négociation peut être rouverte avant son terme.',
      ),
      p(
        'Le texte précise que cette réouverture est de droit lorsqu’une organisation signataire en fait la demande et qu’un indicateur économique défini par l’accord franchit le seuil qu’il fixe. L’inflation et la masse salariale sont les deux références les plus fréquemment retenues dans les accords déjà conclus.',
      ),
      quote(
        'Un cycle long n’est acceptable que s’il reste réversible. C’est tout l’objet de la clause de revoyure : elle transforme une périodicité subie en calendrier négocié.',
      ),
      heading('h2', 'Ce qui ne change pas'),
      p(
        'L’obligation de loyauté demeure inchangée, et avec elle la transmission préalable des informations nécessaires à une négociation utile. La base de données économiques, sociales et environnementales reste le support de droit commun : un employeur qui ouvre une négociation sans l’avoir actualisée s’expose au même grief qu’auparavant.',
      ),
      p(
        'Inchangée également, l’articulation avec les attributions du comité. La négociation relève des organisations syndicales représentatives, la consultation relève du comité, et l’une ne vaut pas l’autre. Un accord sur les salaires ne dispense pas de la consultation sur la politique sociale, qui garde son propre calendrier et son propre objet.',
      ),
      p(
        'Pour les élus qui cumulent un mandat de délégué syndical et un siège au comité, la réforme déplace surtout la charge de travail : moins de réunions annuelles, mais une préparation plus exigeante en amont de chaque cycle, puisque les positions prises engagent sur une période plus longue.',
      ),
    ),
  },
  {
    slug: 'expertise-pour-risque-grave-le-cout-reste-a-la-charge-de-l-employeur',
    title: 'Expertise pour risque grave : le coût reste intégralement à la charge de l’employeur',
    excerpt:
      'La contestation du financement est écartée : le risque grave constaté suffit à faire supporter l’intégralité des honoraires par l’entreprise, sans contribution du budget de fonctionnement du comité.',
    categorySlug: 'budget',
    tagSlugs: ['budget', 'prevention'],
    publishedAt: '2026-09-10T07:15:00.000Z',
    image: 'ouvrages',
    content: richText(
      p(
        'La question revenait régulièrement depuis la réforme du financement des expertises : lorsqu’un comité désigne un expert habilité à la suite d’un risque grave, l’employeur peut-il exiger que le comité prenne une part des honoraires à sa charge ? La réponse est non, et elle est désormais formulée sans ambiguïté.',
      ),
      heading('h2', 'Une exception assumée au cofinancement'),
      p(
        'Le cofinancement à hauteur de vingt pour cent sur le budget de fonctionnement s’applique à plusieurs cas d’expertise, mais pas à celui-ci. L’expertise pour risque grave figure parmi les hypothèses où la loi met l’intégralité du coût à la charge de l’employeur, au même titre que la consultation sur la situation économique et financière ou que l’expertise liée à un projet de licenciement collectif.',
      ),
      p(
        'L’enjeu n’est pas seulement comptable. Faire peser une part des honoraires sur le budget de fonctionnement reviendrait à dissuader les comités les moins dotés de recourir à l’expertise précisément là où elle est la plus nécessaire. La solution retenue préserve l’égalité d’accès entre les comités, quelle que soit la taille de l’entreprise.',
      ),
      heading('h2', 'Le périmètre du risque grave'),
      p(
        'Reste à caractériser le risque grave, qui demeure le véritable terrain de la contestation. Il suppose un risque identifié et actuel, pas une inquiétude générale : le constat doit reposer sur des éléments objectifs, documentés, et révéler une situation qui dépasse les aléas ordinaires de l’activité.',
      ),
      list([
        'Des accidents ou incidents répétés sur un même poste ou un même équipement.',
        'Des alertes convergentes du médecin du travail ou de l’inspection du travail.',
        'Des indicateurs de santé dégradés sur un périmètre identifié, et non sur l’ensemble de l’entreprise.',
        'Un signalement de danger grave et imminent resté sans réponse.',
      ]),
      p(
        'La délibération du comité gagne donc à exposer ces éléments plutôt qu’à se borner à viser le texte applicable. Une désignation motivée résiste nettement mieux à la contestation, et le délai dont dispose l’employeur pour saisir le juge est court : passé ce terme, la désignation devient définitive et le financement avec elle.',
      ),
    ),
  },
  {
    slug: 'document-unique-la-dematerialisation-devient-obligatoire',
    title: 'Document unique : la dématérialisation devient obligatoire au-delà de 150 salariés',
    excerpt:
      'Le dépôt sur le portail numérique national s’impose à une nouvelle tranche d’entreprises. Les versions successives doivent rester consultables pendant quarante ans, y compris par les anciens salariés.',
    categorySlug: 'sante-securite-au-travail',
    tagSlugs: ['prevention', 'procedure'],
    publishedAt: '2026-09-03T06:30:00.000Z',
    content: richText(
      p(
        'L’obligation de dépôt dématérialisé du document unique d’évaluation des risques professionnels franchit une nouvelle étape. Elle s’applique désormais aux entreprises d’au moins cent cinquante salariés, après une première vague réservée aux plus grands effectifs.',
      ),
      heading('h2', 'Déposer, et conserver quarante ans'),
      p(
        'Le dépôt s’effectue sur le portail numérique national, dans un délai courant à compter de la mise à jour du document. Chaque version déposée doit rester consultable pendant quarante ans — une durée calée sur les délais de latence de certaines pathologies professionnelles, qui peuvent se déclarer longtemps après la fin de l’exposition.',
      ),
      p(
        'Cette conservation longue a une conséquence directe : les anciens salariés doivent pouvoir accéder aux versions correspondant à leur période d’emploi. L’entreprise doit donc être en mesure de retrouver et de communiquer une version datée, ce qui suppose un archivage ordonné plutôt qu’un simple empilement de fichiers.',
      ),
      heading('h2', 'Le comité reste associé à la mise à jour'),
      p(
        'La dématérialisation ne modifie pas les attributions du comité. Le document unique est mis à jour au moins annuellement, et à chaque décision d’aménagement important modifiant les conditions de santé et de sécurité. Le comité est associé à cette mise à jour et sa contribution doit apparaître dans le document.',
      ),
      p(
        'En pratique, les élus ont intérêt à vérifier que l’unité de travail retenue n’est pas trop large. Un découpage par grand service masque les expositions propres à un poste et vide l’évaluation de sa portée opérationnelle. C’est le point sur lequel les écarts entre le document et le terrain sont les plus fréquents.',
      ),
      p(
        'Enfin, le dépôt ne vaut pas validation. Aucun contrôle de fond n’est exercé à la réception : un document incomplet déposé dans les délais reste un document incomplet, et l’absence de réaction de l’administration ne saurait être opposée au comité qui en conteste la qualité.',
      ),
    ),
  },
]

/** Téléverse les visuels de démonstration, ou réutilise ceux déjà en base. */
const ensureImages = async (payload: Payload): Promise<Map<string, number>> => {
  const map = new Map<string, number>()

  for (const [key, image] of Object.entries(IMAGES)) {
    const filename = path.basename(image.source)

    const { docs } = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
    })

    const existing = docs[0] as Media | undefined
    if (existing) {
      map.set(key, existing.id)
      continue
    }

    const created = await payload.create({
      collection: 'media',
      data: { alt: image.alt },
      filePath: path.join(process.cwd(), image.source),
    })
    payload.logger.info(`Visuel téléversé : ${filename}`)
    map.set(key, created.id)
  }

  return map
}

export async function seedNews(payload: Payload): Promise<void> {
  const categories = await ensureCategories(payload)
  const tags = await ensureTags(payload)
  const images = await ensureImages(payload)

  // Rejouable : on repart d'une ardoise propre pour ces slugs uniquement.
  const slugs = NEWS.map((item) => item.slug)
  const { docs: existing } = await payload.find({
    collection: 'articles',
    where: { slug: { in: slugs } },
    limit: slugs.length,
    depth: 0,
  })

  if (existing.length > 0) {
    await payload.delete({
      collection: 'articles',
      where: { slug: { in: slugs } },
      context: { disableRevalidate: true },
    })
    payload.logger.info(`${existing.length} actualité(s) de démonstration remplacée(s)`)
  }

  for (const item of NEWS) {
    const categoryId = categories.get(item.categorySlug)
    if (!categoryId) throw new Error(`Catégorie introuvable pour l’actualité « ${item.title} »`)

    await payload.create({
      collection: 'articles',
      context: { disableRevalidate: true },
      data: {
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        content: item.content,
        category: categoryId,
        tags: item.tagSlugs
          .map((slug) => tags.get(slug))
          .filter((id): id is number => typeof id === 'number'),
        featuredImage: item.image ? images.get(item.image) : undefined,
        type: 'news',
        featuredInNews: item.featured ?? false,
        publishedAt: item.publishedAt,
        _status: 'published',
      },
    })

    payload.logger.info(`Actualité publiée : ${item.title}`)
  }
}
