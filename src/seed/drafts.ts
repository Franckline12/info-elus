import type { Payload } from 'payload'

import type { Provider, Quiz } from '../payload-types'
import { callout, heading, list, p, quote, richText, type RichTextContent } from './lexical'
import { ensureImages, type SeedImage } from './media'
import {
  ensureCategories,
  ensureProviderCategories,
  ensureTags,
  ensureThemes,
  type SeedTheme,
} from './taxonomies'

/**
 * Contenus en attente de publication, pour donner à voir le circuit éditorial
 * dans l'admin : deux articles de fond, deux actualités, deux guides, deux quiz
 * et deux fiches prestataire.
 *
 * Chaque document est volontairement **complet et valide** : il passe la
 * validation à l'enregistrement, et peut donc être publié d'un clic en séance
 * de démonstration. Aucun n'atteint le site public tant qu'il reste en
 * brouillon — les lectures publiques filtrent explicitement sur `_status`
 * (`src/lib/queries/*`), et l'annuaire sur la case « Visible sur le site ».
 *
 * Les prestataires n'ont pas de cycle brouillon/publication : la collection
 * s'appuie sur la case `published` (voir `src/collections/Providers.ts`). Leur
 * équivalent du brouillon est donc une fiche décochée.
 *
 * Les textes sont fictifs. Ils imitent le registre d'une publication destinée
 * aux élus mais n'ont aucune valeur juridique : ni les décisions ni les textes
 * réglementaires cités n'existent.
 *
 * Le script est rejouable : les documents portant ces slugs sont supprimés
 * avant d'être recréés, les taxonomies et les visuels sont réutilisés.
 */

/** Visuels déjà versionnés dans le dépôt, partagés avec le seed d'actualité. */
const IMAGES: Record<string, SeedImage> = {
  comptabilite: {
    source: 'public/images/articles.jpeg',
    alt: 'Documents de comptabilité du CSE, calculatrice et lunettes posés sur un bureau',
  },
  ouvrages: {
    source: 'public/images/guides.jpeg',
    alt: 'Pile d’ouvrages juridiques reliés, lunettes et stylo posés sur un bureau en bois',
  },
}

/** Mêmes thèmes que les guides et les quiz publiés : aucune taxonomie en plus. */
const THEMES: SeedTheme[] = [
  { slug: 'elections', name: 'Élections', color: 'blue-bright' },
  { slug: 'budget-finances', name: 'Budget & finances', color: 'blue-mid' },
  { slug: 'sante-securite', name: 'Santé & sécurité', color: 'blue-deep' },
]

type SeedDraftArticle = {
  slug: string
  title: string
  excerpt: string
  type: 'article' | 'news'
  categorySlug: string
  tagSlugs: string[]
  /** Clé de `IMAGES`. Omise, le brouillon attend encore son visuel. */
  image?: string
  content: RichTextContent
}

/**
 * Brouillons de la collection Articles, les deux types confondus : un article
 * de fond et une actualité se préparent dans le même formulaire, seul le champ
 * `type` de la barre latérale les sépare.
 *
 * `publishedAt` reste vide : le hook `populatePublishedAt` la renseigne le jour
 * de la publication, c'est précisément ce que la démonstration montre.
 */
const ARTICLES: SeedDraftArticle[] = [
  {
    slug: 'ordre-du-jour-du-cse-le-preparer-au-lieu-de-le-subir',
    title: 'Ordre du jour du CSE : le préparer au lieu de le subir',
    excerpt:
      'Établi conjointement par l’employeur et le secrétaire, l’ordre du jour décide de ce qui pourra être débattu en séance. Méthode pour y faire entrer les sujets des élus plutôt que de les découvrir en questions diverses.',
    type: 'article',
    categorySlug: 'negociation',
    tagSlugs: ['mandat', 'procedure'],
    image: 'ouvrages',
    content: richText(
      p(
        'C’est le document le plus sous-estimé de la vie du comité. L’ordre du jour n’est pas un simple sommaire de la réunion : il délimite ce sur quoi les élus pourront délibérer, demander une expertise ou faire inscrire un avis. Un sujet absent de l’ordre du jour se discute, mais ne se vote pas.',
      ),
      p(
        'Il est établi conjointement par le président et le secrétaire. Cette conjonction n’est pas une formalité : elle signifie qu’aucun des deux ne peut l’arrêter seul, et que le secrétaire qui se contente de valider une liste rédigée par la direction renonce à la moitié de son pouvoir.',
      ),
      heading('h2', 'Ce que « conjointement » veut dire'),
      p(
        'La rédaction conjointe suppose un échange réel, trace écrite à l’appui. En pratique, le secrétaire gagne à adresser ses propres points par courriel, formulés comme ils devront apparaître à l’ordre du jour, et à conserver la réponse. Le désaccord n’est pas un blocage : chacun peut saisir le juge, mais c’est l’échange documenté qui emporte la décision.',
      ),
      p(
        'Deux exceptions à retenir. Les consultations rendues obligatoires par un texte ou par un accord sont inscrites de plein droit, à la demande de l’un ou de l’autre : le président ne peut pas les écarter, le secrétaire ne peut pas les retenir. Et le délai de communication — trois jours au moins avant la séance, sauf accord plus favorable — court à compter de l’envoi, pas de la rédaction.',
      ),
      heading('h2', 'Faire inscrire un sujet'),
      p(
        'La difficulté la plus courante n’est pas le refus, c’est la dilution : un point des élus est accepté, mais reformulé si largement qu’il ne débouche sur rien. Un intitulé précis, daté et chiffré résiste mieux qu’une formule générale.',
      ),
      list([
        'Écrire le point comme une question fermée : « avis du comité sur le projet de réorganisation du service clients » plutôt que « point sur la réorganisation ».',
        'Préciser la nature attendue de la séquence : information, consultation, ou simple échange.',
        'Nommer les documents demandés en appui, et la date à laquelle ils doivent être transmis.',
        'Rappeler les suites d’un point déjà abordé, en citant la date du procès-verbal correspondant.',
      ]),
      callout('keyPoint', [
        'Les « questions diverses » ne remplacent pas une inscription à l’ordre du jour. Un sujet abordé sous cette rubrique ne peut pas donner lieu à un avis valablement rendu : si l’enjeu compte, il doit figurer comme point à part entière.',
      ]),
      heading('h2', 'Après la séance'),
      p(
        'L’ordre du jour sert une seconde fois, au moment de la rédaction du procès-verbal : il en fixe la structure et permet de vérifier qu’aucun point n’a été escamoté faute de temps. Un point renvoyé à la réunion suivante se note comme tel, avec la date de report — c’est la seule façon d’empêcher qu’il disparaisse.',
      ),
      p(
        'Les comités qui tiennent un tableau de suivi des points reportés constatent vite l’effet : les sujets inconfortables cessent d’être ajournés indéfiniment, puisque le report devient visible et daté.',
      ),
    ),
  },
  {
    slug: 'recourir-a-un-expert-choisir-le-motif-et-securiser-le-financement',
    title: 'Recourir à un expert : choisir le motif et sécuriser le financement',
    excerpt:
      'Le motif de la désignation détermine qui paie et dans quel délai l’employeur peut la contester. Panorama des cas de recours et des erreurs de délibération qui coûtent cher au budget de fonctionnement.',
    type: 'article',
    categorySlug: 'budget',
    tagSlugs: ['budget', 'procedure'],
    image: 'comptabilite',
    content: richText(
      p(
        'L’expertise est le levier le plus puissant dont dispose le comité, et le plus mal utilisé. Non pas faute de motifs — ils sont nombreux — mais parce que la délibération est souvent rédigée après coup, sans dire clairement sur quel fondement le comité agit. Or c’est ce fondement qui décide de tout : du financement, du délai de contestation, et de l’étendue de la mission.',
      ),
      heading('h2', 'Trois régimes de financement, pas un seul'),
      p(
        'Le premier régime met l’intégralité du coût à la charge de l’employeur. Il couvre notamment la consultation sur la situation économique et financière, celle sur la politique sociale, l’expertise pour risque grave et celle qui accompagne un projet de licenciement collectif.',
      ),
      p(
        'Le deuxième prévoit un cofinancement : l’employeur prend en charge l’essentiel, le comité le reste sur son budget de fonctionnement. C’est le régime de droit commun des consultations ponctuelles, au premier rang desquelles les projets importants modifiant les conditions de travail.',
      ),
      p(
        'Le troisième laisse le coût entièrement au comité : ce sont les expertises libres, décidées pour la préparation de ses propres travaux. Elles n’ouvrent aucun délai de consultation et ne s’imposent pas à l’employeur, qui n’a pas à communiquer de documents à l’expert.',
      ),
      callout('warning', [
        'Un comité dont le budget de fonctionnement est épuisé ne peut pas, pour autant, basculer une expertise cofinancée dans le régime de la prise en charge intégrale. Mieux vaut vérifier la trésorerie disponible avant de délibérer que de découvrir le dépassement à la réception de la facture.',
      ]),
      heading('h2', 'Rédiger la délibération'),
      p(
        'La délibération est le seul document que le juge examinera si l’employeur contredit la désignation. Elle gagne à exposer les faits plutôt qu’à viser des articles : ce que le comité constate, ce qu’il ignore encore, et en quoi l’expertise est nécessaire pour rendre un avis éclairé.',
      ),
      list([
        'Nommer le motif légal retenu, et lui seul : cumuler les fondements fragilise la désignation.',
        'Décrire les éléments de fait constatés, avec leurs dates et leur source.',
        'Définir le périmètre de la mission et, si possible, le délai attendu.',
        'Désigner le cabinet nommément, après avoir vérifié son habilitation quand le motif l’exige.',
        'Mandater le secrétaire pour signer la lettre de mission et suivre les échanges.',
      ]),
      heading('h2', 'Le délai de contestation'),
      p(
        'L’employeur qui conteste — le principe, le coût, l’étendue ou le choix de l’expert — doit saisir le juge dans un délai court, calculé à compter de la désignation. Passé ce terme, la désignation devient définitive : c’est une protection pour le comité, à condition que la date de la délibération soit certaine.',
      ),
      p(
        'D’où une précaution simple : faire figurer au procès-verbal l’heure du vote, le résultat du décompte et la liste des présents. Une délibération dont la date est discutable, c’est un délai de contestation qui ne commence jamais à courir.',
      ),
    ),
  },
  {
    slug: 'bdese-les-indicateurs-environnementaux-entrent-dans-le-contenu-minimal',
    title: 'BDESE : les indicateurs environnementaux entrent dans le contenu minimal',
    excerpt:
      'Un décret ajoute une rubrique environnementale au contenu supplétif de la base de données économiques, sociales et environnementales. Les entreprises d’au moins 300 salariés doivent l’alimenter dès le prochain exercice.',
    type: 'news',
    categorySlug: 'negociation',
    tagSlugs: ['procedure', 'mandat'],
    image: 'comptabilite',
    content: richText(
      p(
        'La lettre « E » de la BDESE cesse d’être décorative. Un décret précise le contenu de la rubrique environnementale du socle supplétif — celui qui s’applique à défaut d’accord d’entreprise — et fixe les indicateurs que l’employeur devra y faire figurer.',
      ),
      heading('h2', 'Ce que la rubrique doit contenir'),
      p(
        'Trois familles d’indicateurs sont retenues : la consommation d’énergie et sa trajectoire sur trois exercices, la production de déchets par grande catégorie, et les postes d’émissions directement rattachables à l’activité. Chaque indicateur est accompagné de sa méthode de calcul, ce qui permet au comité de vérifier la comparabilité d’une année sur l’autre.',
      ),
      p(
        'Le texte ne crée pas de consultation nouvelle. Il alimente celles qui existent : la rubrique est mobilisable dans la consultation sur les orientations stratégiques, où les conséquences environnementales de l’activité font déjà partie des thèmes obligatoires.',
      ),
      heading('h2', 'Un accord peut toujours faire autrement'),
      p(
        'Le contenu reste supplétif : un accord d’entreprise peut organiser la rubrique différemment, à condition de ne pas descendre sous les thèmes obligatoires. Les élus qui négocient sur ce terrain ont intérêt à discuter moins la liste des indicateurs que leur fréquence de mise à jour et leur granularité par site.',
      ),
      list([
        'Vérifier que la base est accessible en permanence, et non transmise en pièce jointe avant chaque réunion.',
        'Demander la méthode de calcul en même temps que les chiffres : sans elle, la comparaison d’un exercice à l’autre ne vaut rien.',
        'Faire préciser le périmètre retenu lorsque l’entreprise compte plusieurs établissements.',
      ]),
      p(
        'Les entreprises de moins de 300 salariés restent sur un socle allégé. Le décret ne les soumet pas à la rubrique environnementale, mais rien n’interdit à un accord de l’y introduire.',
      ),
    ),
  },
  {
    slug: 'subvention-des-asc-le-juge-ecarte-la-masse-salariale-previsionnelle',
    title: 'Subvention des ASC : le juge écarte le calcul sur la masse salariale prévisionnelle',
    excerpt:
      'L’assiette de la contribution aux activités sociales et culturelles se calcule sur la masse salariale constatée, pas sur le budget prévisionnel de l’entreprise. Les comités concernés peuvent réclamer le différentiel.',
    type: 'news',
    categorySlug: 'budget',
    tagSlugs: ['budget', 'procedure'],
    content: richText(
      p(
        'La pratique était répandue dans les groupes dotés d’une direction financière centralisée : verser la contribution aux activités sociales et culturelles par douzièmes, calculés sur la masse salariale inscrite au budget prévisionnel, puis régulariser « si nécessaire » en fin d’exercice. Le juge y met un terme.',
      ),
      heading('h2', 'L’assiette est une donnée constatée'),
      p(
        'Le raisonnement est simple : l’assiette de la contribution est définie par référence à des rémunérations effectivement versées. Une prévision budgétaire, même sincère, n’est pas une rémunération versée. Le versement par acomptes reste possible, mais il doit être régularisé sur la base des comptes de l’exercice, et la régularisation n’est pas une faveur.',
      ),
      p(
        'La décision précise en outre que le comité n’a pas à démontrer un préjudice pour obtenir le différentiel : l’écart entre la contribution due et la contribution versée suffit.',
      ),
      callout('keyPoint', [
        'La régularisation suppose d’obtenir les comptes. Un comité qui demande chaque année le détail de l’assiette retenue — ligne par ligne, et non le seul montant global — se donne les moyens de vérifier le calcul sans attendre un contentieux.',
      ]),
      heading('h2', 'Jusqu’où peut-on remonter'),
      p(
        'La question du rappel reste gouvernée par la prescription applicable aux créances salariales, soit trois ans à compter de la connaissance du montant exact. Les comités qui n’ont jamais reçu le détail de l’assiette peuvent donc, en pratique, remonter plus loin que ne le laisse penser une lecture rapide du délai.',
      ),
      quote(
        'Une contribution calculée sur une prévision n’est pas une contribution calculée : c’est une avance, et une avance se régularise.',
      ),
      p(
        'Pour les directions, l’arrêt n’interdit pas le versement mensuel, qui reste commode pour la trésorerie du comité. Il impose seulement d’en tirer la conséquence comptable au bon moment.',
      ),
    ),
  },
]

type SeedDraftGuide = {
  slug: string
  title: string
  summary: string
  themeSlug: string
  tagSlugs: string[]
  sections: { heading: string; content: RichTextContent }[]
}

/**
 * Brouillons de guides : chacun compte assez de sections pour que le sommaire
 * interne soit visible à l'aperçu. Les ancres sont dérivées des titres par le
 * hook `uniqueSectionAnchors`, le seed ne les renseigne pas.
 */
const GUIDES: SeedDraftGuide[] = [
  {
    slug: 'preparer-la-premiere-reunion-du-cse-apres-les-elections',
    title: 'Préparer la première réunion du CSE après les élections',
    summary:
      'Désignation du secrétaire et du trésorier, règlement intérieur, moyens de fonctionnement : la réunion d’installation fixe le cadre des quatre années de mandat. Ce qu’il faut avoir arrêté avant d’entrer en séance.',
    themeSlug: 'elections',
    tagSlugs: ['mandat', 'procedure'],
    sections: [
      {
        heading: 'Ce qui doit être décidé en séance d’installation',
        content: richText(
          p(
            'La première réunion suit de près la proclamation des résultats. Elle n’a rien d’une formalité : c’est là que le comité se dote des personnes et des règles sans lesquelles il ne peut pas agir. Un comité installé à la hâte passe souvent ses premiers mois à réparer ce qui n’a pas été décidé ce jour-là.',
          ),
          p(
            'Deux désignations sont obligatoires parmi les membres titulaires : le secrétaire et, dans les entreprises d’au moins cinquante salariés, le trésorier. Les deux fonctions supposent un vote, et le vote suppose des candidats : la règle veut qu’on en parle avant la séance, pas pendant.',
          ),
          list([
            'Désignation du secrétaire et du trésorier, et de leurs adjoints si le comité en prévoit.',
            'Mise en place de la commission santé, sécurité et conditions de travail lorsque l’effectif l’impose.',
            'Ouverture du compte bancaire du comité et choix des signatures autorisées.',
            'Calendrier des réunions ordinaires de l’année, arrêté avec le président.',
          ]),
        ),
      },
      {
        heading: 'Le règlement intérieur, à rédiger sans attendre',
        content: richText(
          p(
            'Le règlement intérieur du comité fixe ses modalités de fonctionnement : convocation, quorum, modalités de vote, rédaction et approbation des procès-verbaux, fonctionnement des commissions. Il n’est pas imposé par la loi dans son contenu, ce qui laisse au comité une latitude considérable — et explique qu’un règlement bâclé pèse quatre ans.',
          ),
          p(
            'Trois points méritent une rédaction soignée, parce qu’ils sont la source la plus fréquente des désaccords : le délai de transmission des documents avant chaque réunion, les règles d’enregistrement et de retranscription des séances, et la répartition des moyens entre les élus.',
          ),
          callout('info', [
            'Le règlement intérieur du comité ne se confond pas avec celui de l’entreprise. Le premier est adopté par le comité pour organiser ses propres travaux ; le second est établi par l’employeur et soumis à la consultation du comité.',
          ]),
        ),
      },
      {
        heading: 'Obtenir les moyens de fonctionner',
        content: richText(
          p(
            'Le local, le matériel, l’affichage, l’accès aux outils numériques de l’entreprise : ces moyens ne sont pas détaillés par la loi, ils se négocient. La réunion d’installation est le bon moment pour poser la liste, parce que la direction est alors la plus disposée à l’examiner.',
          ),
          p(
            'Le transfert des archives du comité sortant est l’angle mort le plus coûteux. Procès-verbaux, comptes, contrats en cours, inventaire des biens, dossiers d’activités sociales : sans eux, le nouveau comité redécouvre tout. Le point se demande par écrit, avec un inventaire contradictoire.',
          ),
          list([
            'Inventaire signé des biens et des contrats transférés.',
            'Accès aux comptes bancaires et remise des pièces comptables du dernier exercice.',
            'Liste des prestataires et des engagements en cours, avec leurs échéances.',
            'Fichier des bénéficiaires des activités sociales, traité conformément au RGPD.',
          ]),
        ),
      },
    ],
  },
  {
    slug: 'presenter-les-comptes-annuels-du-cse',
    title: 'Présenter les comptes annuels du CSE',
    summary:
      'Arrêté des comptes, rapport d’activité et de gestion, approbation en séance, information des salariés : le calendrier comptable du comité et les obligations qui varient selon sa taille.',
    themeSlug: 'budget-finances',
    tagSlugs: ['budget', 'procedure'],
    sections: [
      {
        heading: 'Trois régimes selon la taille du comité',
        content: richText(
          p(
            'Les obligations comptables du comité ne sont pas uniformes : elles dépendent de ses ressources annuelles et, au-delà d’un certain seuil, du cumul de plusieurs critères portant sur les ressources, le total du bilan et le nombre de salariés employés par le comité lui-même.',
          ),
          p(
            'Les petits comités tiennent une comptabilité ultra-simplifiée : un livre retraçant les recettes et les dépenses, et un état de synthèse annuel sur le patrimoine et les engagements. Les comités intermédiaires établissent des comptes annuels simplifiés. Les plus importants suivent le droit commun et nomment un commissaire aux comptes.',
          ),
          callout('keyPoint', [
            'Dans tous les cas, les deux budgets — fonctionnement et activités sociales et culturelles — sont suivis séparément. Un comité qui présente un solde unique n’est pas en mesure de démontrer qu’il n’a pas financé l’un avec l’autre.',
          ]),
        ),
      },
      {
        heading: 'Arrêter les comptes et rédiger le rapport',
        content: richText(
          p(
            'Les comptes sont arrêtés par les membres élus désignés par le règlement intérieur du comité — en pratique le trésorier, avec le secrétaire. L’arrêté n’est pas l’approbation : il prépare le document qui sera soumis au vote.',
          ),
          p(
            'Le rapport d’activité et de gestion accompagne les comptes. Il décrit l’organisation du comité, les activités conduites dans l’année, l’utilisation de chacun des deux budgets et, le cas échéant, les transferts opérés entre eux. C’est le document que les salariés liront : il gagne à être lisible plutôt qu’exhaustif.',
          ),
          list([
            'Rapprocher le relevé bancaire et le livre des recettes et dépenses avant d’arrêter quoi que ce soit.',
            'Isoler les engagements pris et non encore payés, qui pèseront sur l’exercice suivant.',
            'Documenter chaque transfert entre budgets par la délibération qui l’a autorisé.',
            'Chiffrer la participation des salariés aux activités, pour éclairer les choix de l’année suivante.',
          ]),
        ),
      },
      {
        heading: 'Approuver, publier, archiver',
        content: richText(
          p(
            'L’approbation des comptes relève d’une réunion du comité spécifiquement consacrée à ce point, distincte de celle qui traite les sujets courants, et dont le procès-verbal est établi à part. Le point est inscrit à l’ordre du jour comme tel, et les documents sont transmis aux élus avant la séance.',
          ),
          p(
            'Les comptes et le rapport sont ensuite portés à la connaissance des salariés par tout moyen. L’affichage reste le plus simple ; une mise en ligne sur l’intranet du comité convient également, à condition qu’elle soit accessible à tous, y compris aux salariés sans poste informatique.',
          ),
          quote(
            'Un comité qui publie des comptes lisibles se protège mieux qu’un comité qui publie des comptes irréprochables mais illisibles : la contestation naît presque toujours de l’opacité, rarement de l’erreur.',
          ),
        ),
      },
    ],
  },
]

type SeedDraftQuiz = {
  slug: string
  title: string
  intro: string
  themeSlug: string
  /** Lundi de la semaine concernée, à venir : le quiz ne vole pas la vedette. */
  week: string
  questions: NonNullable<Quiz['questions']>
}

/**
 * Brouillons de quiz : cinq questions chacun, une seule bonne réponse par
 * question, explication rédigée. Ils satisfont donc `validateQuestions` et
 * peuvent être publiés en séance.
 *
 * Leur semaine est postérieure à celle des quiz publiés : même publiés, ils ne
 * remplaceraient le quiz de la semaine qu'à la date prévue.
 */
const QUIZZES: SeedDraftQuiz[] = [
  {
    slug: 'heures-de-delegation-le-decompte-en-pratique',
    title: 'Heures de délégation : le décompte en pratique',
    intro:
      'Crédit mensuel, mutualisation, dépassement, temps de trajet : cinq questions pour vérifier ce qui se décompte vraiment des heures de délégation.',
    themeSlug: 'elections',
    week: '2026-10-12T00:00:00.000Z',
    questions: [
      {
        prompt:
          'Le temps passé en réunion ordinaire du CSE, sur convocation de l’employeur, s’impute-t-il sur le crédit d’heures de délégation ?',
        options: [
          {
            text: 'Non : il est payé comme temps de travail, en plus du crédit d’heures',
            isCorrect: true,
          },
          { text: 'Oui, pour la totalité de la durée de la réunion', isCorrect: false },
          { text: 'Oui, mais pour la moitié seulement', isCorrect: false },
          { text: 'Seulement au-delà de quatre réunions par an', isCorrect: false },
        ],
        explanation:
          'Le temps passé aux réunions auxquelles l’employeur convoque les élus n’est pas déduit du crédit d’heures : il est rémunéré comme temps de travail effectif et s’y ajoute. Le crédit est destiné aux déplacements et aux travaux que les élus mènent de leur propre initiative.',
        points: 1,
      },
      {
        prompt: 'Un titulaire peut-il transférer une partie de ses heures à un suppléant ?',
        options: [
          {
            text: 'Oui, dans la limite d’une fois et demie le crédit mensuel du bénéficiaire',
            isCorrect: true,
          },
          { text: 'Non : les heures sont strictement personnelles', isCorrect: false },
          { text: 'Oui, sans aucune limite de volume', isCorrect: false },
          { text: 'Seulement si le suppléant remplace un titulaire absent', isCorrect: false },
        ],
        explanation:
          'La mutualisation est permise entre titulaires, et d’un titulaire vers un suppléant. Elle est plafonnée : un élu ne peut pas disposer, sur un mois, de plus d’une fois et demie son propre crédit. L’employeur doit être informé huit jours avant l’utilisation des heures mutualisées.',
        points: 1,
      },
      {
        prompt: 'Les heures non utilisées un mois donné sont-elles définitivement perdues ?',
        options: [
          {
            text: 'Non : elles peuvent être reportées, dans la limite de douze mois',
            isCorrect: true,
          },
          { text: 'Oui : le crédit est mensuel et non reportable', isCorrect: false },
          { text: 'Non : elles sont reportables sans limite de durée', isCorrect: false },
          { text: 'Elles sont converties en jours de repos', isCorrect: false },
        ],
        explanation:
          'Le report est possible d’un mois sur l’autre sur une période de douze mois, à condition de ne pas conduire un élu à disposer, sur un mois, de plus d’une fois et demie son crédit. Comme pour la mutualisation, l’employeur est informé huit jours à l’avance.',
        points: 1,
      },
      {
        prompt:
          'L’employeur peut-il refuser de payer des heures de délégation qu’il juge injustifiées ?',
        options: [
          {
            text: 'Non : il doit payer à l’échéance, puis contester devant le juge s’il le souhaite',
            isCorrect: true,
          },
          { text: 'Oui, s’il demande d’abord des justificatifs à l’élu', isCorrect: false },
          { text: 'Oui, dès lors que le bon de délégation n’a pas été rempli', isCorrect: false },
          { text: 'Oui, mais seulement après avis du comité', isCorrect: false },
        ],
        explanation:
          'Les heures de délégation sont présumées utilisées conformément au mandat. L’employeur doit les payer à l’échéance normale de la paie ; s’il en contredit l’usage, il lui appartient de saisir le juge et de démontrer la non-conformité. Retenir le paiement par avance est constitutif d’une entrave.',
        points: 1,
      },
      {
        prompt: 'Quel est le rôle d’un bon de délégation ?',
        options: [
          {
            text: 'Informer l’employeur du départ en délégation, sans conditionner l’exercice du mandat',
            isCorrect: true,
          },
          { text: 'Obtenir l’autorisation préalable de la hiérarchie', isCorrect: false },
          {
            text: 'Justifier l’objet précis de la mission auprès de l’employeur',
            isCorrect: false,
          },
          { text: 'Déclencher le paiement des heures à la fin du mois', isCorrect: false },
        ],
        explanation:
          'Un bon de délégation est admis comme outil d’information et de gestion : il permet à l’employeur de savoir qui s’absente et pour combien de temps. Il ne peut en revanche pas être transformé en autorisation préalable, ni exiger la mention de l’objet de la mission.',
        points: 1,
      },
    ],
  },
  {
    slug: 'risques-psychosociaux-reperer-et-alerter',
    title: 'Risques psychosociaux : repérer et alerter',
    intro:
      'Évaluation, enquête, droit d’alerte, articulation avec le médecin du travail : cinq questions sur les moyens dont le comité dispose face aux risques psychosociaux.',
    themeSlug: 'sante-securite',
    week: '2026-10-19T00:00:00.000Z',
    questions: [
      {
        prompt: 'Les risques psychosociaux doivent-ils figurer dans le document unique ?',
        options: [
          {
            text: 'Oui : ils relèvent de l’évaluation des risques comme les risques physiques',
            isCorrect: true,
          },
          { text: 'Non : ils relèvent du seul médecin du travail', isCorrect: false },
          { text: 'Seulement après un premier arrêt de travail lié au stress', isCorrect: false },
          { text: 'Seulement dans les entreprises de plus de 300 salariés', isCorrect: false },
        ],
        explanation:
          'L’évaluation des risques porte sur tous les risques professionnels, y compris ceux liés à l’organisation du travail, aux relations de travail et à la charge mentale. Leur absence du document unique est en soi une carence, indépendamment de tout accident.',
        points: 1,
      },
      {
        prompt: 'Qui déclenche le droit d’alerte pour danger grave et imminent ?',
        options: [
          { text: 'Tout membre élu du comité qui constate la situation', isCorrect: true },
          { text: 'Le secrétaire du comité, après délibération en séance', isCorrect: false },
          {
            text: 'La commission santé, sécurité et conditions de travail collégialement',
            isCorrect: false,
          },
          { text: 'Le médecin du travail, saisi par un élu', isCorrect: false },
        ],
        explanation:
          'Le droit d’alerte est individuel : un seul membre élu suffit, sans attendre de délibération. Il consigne son constat sur le registre prévu à cet effet, ce qui oblige l’employeur à procéder immédiatement à une enquête avec lui.',
        points: 1,
      },
      {
        prompt: 'Après une alerte pour danger grave et imminent, que doit faire l’employeur ?',
        options: [
          { text: 'Procéder immédiatement à une enquête avec l’élu qui a alerté', isCorrect: true },
          {
            text: 'Inscrire le point à l’ordre du jour de la prochaine réunion ordinaire',
            isCorrect: false,
          },
          { text: 'Saisir l’inspection du travail dans les huit jours', isCorrect: false },
          {
            text: 'Faire constater la situation par le médecin du travail avant toute enquête',
            isCorrect: false,
          },
        ],
        explanation:
          'L’enquête est immédiate et conjointe. En cas de divergence sur la réalité du danger ou sur les mesures à prendre, le comité est réuni d’urgence et l’inspection du travail peut être saisie — mais après l’enquête, pas à sa place.',
        points: 1,
      },
      {
        prompt:
          'Le comité peut-il désigner un expert habilité pour un risque psychosocial constaté ?',
        options: [
          {
            text: 'Oui, au titre du risque grave, et le coût est alors supporté par l’employeur',
            isCorrect: true,
          },
          {
            text: 'Non : l’expertise pour risque grave est réservée aux risques physiques',
            isCorrect: false,
          },
          {
            text: 'Oui, mais en finançant l’expertise sur son budget de fonctionnement',
            isCorrect: false,
          },
          {
            text: 'Oui, à condition d’obtenir l’accord préalable de l’employeur',
            isCorrect: false,
          },
        ],
        explanation:
          'Un risque psychosocial identifié, documenté et actuel peut fonder une expertise pour risque grave, intégralement financée par l’employeur. La difficulté n’est pas la nature du risque mais sa caractérisation : il faut des éléments objectifs, pas un climat général.',
        points: 1,
      },
      {
        prompt: 'Le médecin du travail peut-il être entendu par le comité ?',
        options: [
          {
            text: 'Oui : il assiste aux réunions portant sur la santé et la sécurité, avec voix consultative',
            isCorrect: true,
          },
          { text: 'Non : le secret médical le lui interdit', isCorrect: false },
          { text: 'Seulement sur invitation de l’employeur', isCorrect: false },
          { text: 'Seulement pour présenter son rapport annuel', isCorrect: false },
        ],
        explanation:
          'Le médecin du travail participe avec voix consultative aux réunions consacrées à la santé, à la sécurité et aux conditions de travail. Le secret médical lui interdit de livrer des données individuelles, pas d’éclairer le comité sur des constats collectifs.',
        points: 1,
      },
    ],
  },
]

type SeedDraftProvider = {
  slug: string
  name: string
  categorySlug: string
  shortDescription: string
  interventionAreas: NonNullable<Provider['interventionAreas']>
  contact: NonNullable<Provider['contact']>
  description: RichTextContent
}

/**
 * Fiches prestataire en attente de validation : renseignées, mais décochées.
 * Elles apparaissent dans l'admin et nulle part ailleurs — c'est l'équivalent
 * du brouillon pour cette collection.
 */
const PROVIDERS: SeedDraftProvider[] = [
  {
    slug: 'reperes-et-mandat',
    name: 'Repères & Mandat',
    categorySlug: 'formation',
    shortDescription:
      'Formations courtes au fonctionnement du CSE, construites autour des documents réels du comité : budget, ordre du jour, procès-verbal.',
    interventionAreas: ['grand-est', 'bourgogne-franche-comte'],
    contact: {
      contactName: 'Camille Ferrand',
      email: 'bonjour@reperes-mandat.example',
      phone: '03 88 00 00 00',
      website: 'https://reperes-mandat.example',
    },
    description: richText(
      p(
        'Repères & Mandat part des documents que les élus ont réellement sous la main : un compte de résultat, un ordre du jour contesté, un projet de réorganisation. Les sessions se construisent à partir de ces pièces plutôt que sur des cas d’école.',
      ),
      heading('h3', 'Formats proposés'),
      list([
        'Prise de fonction : deux jours sur le rôle du comité, ses budgets et son calendrier.',
        'Lire les comptes de l’entreprise : une journée, à partir des liasses de l’année en cours.',
        'Préparer une consultation : une demi-journée, en amont d’un projet annoncé.',
      ]),
      p(
        'Les sessions se tiennent dans les locaux de l’entreprise ou en salle louée, avec un maximum de douze participants. Les supports restent la propriété du comité.',
      ),
    ),
  },
  {
    slug: 'odyssee-collective',
    name: 'Odyssée Collective',
    categorySlug: 'evenementiel',
    shortDescription:
      'Organisation de sorties et de séjours pour les comités, avec une grille tarifaire transparente et un accompagnement sur la billetterie des familles.',
    interventionAreas: ['nouvelle-aquitaine', 'occitanie'],
    contact: {
      contactName: 'Thierry Nguyen',
      email: 'contact@odyssee-collective.example',
      phone: '05 56 00 00 00',
      website: 'https://odyssee-collective.example',
    },
    description: richText(
      p(
        'Odyssée Collective conçoit des sorties à la journée et des séjours courts pour les comités de taille moyenne, avec une attention particulière portée aux familles : tarification par quotient, inscription en ligne et liste d’attente gérée pour le compte du comité.',
      ),
      heading('h3', 'Ce qui est inclus'),
      list([
        'Devis détaillé poste par poste, sans forfait d’organisation opaque.',
        'Gestion des inscriptions et des annulations, avec un point hebdomadaire au trésorier.',
        'Attestations de participation pour la comptabilité des activités sociales.',
      ]),
      quote(
        'Un séjour réussi se juge au nombre de familles qui ont pu partir, pas au nombre de places vendues.',
      ),
      p(
        'Le prestataire intervient sur la Nouvelle-Aquitaine et l’Occitanie, avec des destinations en France métropolitaine et en Espagne du Nord.',
      ),
    ),
  },
]

/** Supprime les documents de démonstration portant ces slugs, s'il en reste. */
const replaceBySlug = async (
  payload: Payload,
  collection: 'articles' | 'guides' | 'quizzes' | 'providers',
  slugs: string[],
  label: string,
): Promise<void> => {
  const { docs } = await payload.find({
    collection,
    where: { slug: { in: slugs } },
    limit: slugs.length,
    depth: 0,
  })

  if (docs.length === 0) return

  await payload.delete({
    collection,
    where: { slug: { in: slugs } },
    context: { disableRevalidate: true },
  })
  payload.logger.info(`${docs.length} ${label} de démonstration remplacé(s)`)
}

export async function seedDrafts(payload: Payload): Promise<void> {
  const [categories, providerCategories, tags, themes, images] = [
    await ensureCategories(payload),
    await ensureProviderCategories(payload),
    await ensureTags(payload),
    await ensureThemes(payload, THEMES),
    await ensureImages(payload, IMAGES),
  ]

  await replaceBySlug(
    payload,
    'articles',
    ARTICLES.map((article) => article.slug),
    'brouillon(s) d’article',
  )

  for (const article of ARTICLES) {
    const categoryId = categories.get(article.categorySlug)
    if (!categoryId) throw new Error(`Catégorie introuvable pour le brouillon « ${article.title} »`)

    await payload.create({
      collection: 'articles',
      context: { disableRevalidate: true },
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        category: categoryId,
        tags: article.tagSlugs
          .map((slug) => tags.get(slug))
          .filter((id): id is number => typeof id === 'number'),
        featuredImage: article.image ? images.get(article.image) : undefined,
        type: article.type,
        // Un brouillon ne prend ni la une de l'accueil ni le grand format.
        featuredOnHome: false,
        featuredInNews: false,
        _status: 'draft',
      },
    })

    payload.logger.info(
      `Brouillon créé : ${article.title} (${article.type === 'news' ? 'actualité' : 'article de fond'})`,
    )
  }

  await replaceBySlug(
    payload,
    'guides',
    GUIDES.map((guide) => guide.slug),
    'brouillon(s) de guide',
  )

  for (const guide of GUIDES) {
    const themeId = themes.get(guide.themeSlug)
    if (!themeId) throw new Error(`Thème introuvable pour le brouillon « ${guide.title} »`)

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
        featuredOnHome: false,
        _status: 'draft',
      },
    })

    payload.logger.info(`Brouillon créé : ${guide.title} (guide)`)
  }

  await replaceBySlug(
    payload,
    'quizzes',
    QUIZZES.map((quiz) => quiz.slug),
    'brouillon(s) de quiz',
  )

  for (const quiz of QUIZZES) {
    const themeId = themes.get(quiz.themeSlug)
    if (!themeId) throw new Error(`Thème introuvable pour le brouillon « ${quiz.title} »`)

    await payload.create({
      collection: 'quizzes',
      context: { disableRevalidate: true },
      data: {
        title: quiz.title,
        slug: quiz.slug,
        intro: quiz.intro,
        theme: themeId,
        week: quiz.week,
        questions: quiz.questions,
        _status: 'draft',
      },
    })

    payload.logger.info(`Brouillon créé : ${quiz.title} (quiz)`)
  }

  await replaceBySlug(
    payload,
    'providers',
    PROVIDERS.map((provider) => provider.slug),
    'fiche(s) prestataire',
  )

  for (const provider of PROVIDERS) {
    const categoryId = providerCategories.get(provider.categorySlug)
    if (!categoryId) throw new Error(`Catégorie introuvable pour le brouillon « ${provider.name} »`)

    await payload.create({
      collection: 'providers',
      context: { disableRevalidate: true },
      data: {
        name: provider.name,
        slug: provider.slug,
        shortDescription: provider.shortDescription,
        description: provider.description,
        category: categoryId,
        interventionAreas: provider.interventionAreas,
        contact: provider.contact,
        // Équivalent du brouillon ici : la fiche attend sa relecture.
        published: false,
      },
    })

    payload.logger.info(`Fiche en attente de validation : ${provider.name} (prestataire)`)
  }
}
