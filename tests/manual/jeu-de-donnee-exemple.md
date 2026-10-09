# Jeu de données d'exemple — saisie manuelle dans l'admin

Contenus prêts à coller dans les formulaires de `http://localhost:3000/admin`,
pour un test réel de bout en bout : taxonomies, articles de fond, actualité,
guides, quiz, prestataires, témoignages, newsletter.

Ces exemples sont **nouveaux** : ils ne doublonnent aucun titre créé par
`npm run seed`, on peut donc les saisir à côté du jeu de démonstration.

## Avant de commencer

```bash
docker compose up -d        # conteneur infos-elus-db
npm run dev                 # http://localhost:3000
npm run seed                # optionnel : taxonomies + contenus de démonstration
```

Trois rappels sur le fonctionnement des formulaires :

- **Le slug se remplit tout seul** depuis le titre. Ne le touchez que pour le
  corriger ; il est indiqué ici à titre de contrôle.
- **Le corps de texte est un éditeur Lexical**, pas du Markdown. Collez le
  paragraphe, puis appliquez le style avec la barre d'outils. Les raccourcis
  Markdown fonctionnent seulement **à la frappe** (`## ` + espace donne un
  Titre 2, `- ` + espace une puce, `> ` + espace une citation) ; un `##` collé
  reste du texte.
- Les marqueurs `[Titre 2]`, `[Liste à puces]`, `[Citation]`,
  `[Encadré — …]` ci-dessous ne se collent pas : ils disent quel style
  appliquer au bloc qui suit.

---

## 1. Médias

Les images ne sont pas fournies : prenez n'importe quel visuel (1600 × 900 px
suffit) et renseignez l'**alt**, qui est obligatoire. Textes alternatifs prêts
à coller, un par contenu de ce document :

| Fichier                                                               | Alt                                                           |
| --------------------------------------------------------------------- | ------------------------------------------------------------- |
| Image de l'article « Consultation sur les orientations stratégiques » | `Réunion de CSE autour d'un document de consultation`         |
| Image de l'article « Local du CSE »                                   | `Porte vitrée d'un local de CSE dans un couloir d'entreprise` |
| Image de l'actualité « Télétravail »                                  | `Salarié en télétravail devant un ordinateur portable`        |
| Image de l'actualité « Subvention de fonctionnement »                 | `Calculatrice posée sur des tableaux comptables`              |
| Image du guide « Négocier un accord d'entreprise »                    | `Table de négociation avec deux liasses de documents`         |
| Logo d'un prestataire                                                 | `Logo de <nom du prestataire>`                                |

---

## 2. Taxonomies

À créer si vous n'avez pas lancé `npm run seed`. Les trois taxonomies vivent
dans le groupe **Taxonomies** du menu de l'admin.

### Catégories (articles et actualité)

| Nom                           | Description                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| `Négociation`                 | `Accords d'entreprise, NAO, méthode et rapport de force dans la négociation collective.`              |
| `Santé & sécurité au travail` | `Prévention des risques, document unique, enquêtes après accident, CSSCT.`                            |
| `Budget`                      | `Subvention de fonctionnement, budget des activités sociales et culturelles, comptabilité du comité.` |
| `Élections`                   | `Protocole d'accord préélectoral, scrutin, contentieux et renouvellement du mandat.`                  |
| `Vie du mandat`               | `Heures de délégation, moyens matériels, formation des élus et relations avec l'employeur.`           |

### Thèmes (guides et quiz) — une couleur par thème

| Nom                      | Couleur      |
| ------------------------ | ------------ |
| `Élections`              | Bleu vif     |
| `Budget & finances`      | Bleu moyen   |
| `Santé & sécurité`       | Bleu profond |
| `Négociation collective` | Bleu moyen   |

### Tags (transverses)

`Mandat` · `Budget` · `Prévention` · `Procédure` · `Négociation` · `Consultation` · `Moyens du CSE`

---

## 3. Articles de fond

Collection **Articles**, champ **Type** = `Article de fond` (barre latérale).
L'enregistrement est en autosave : utilisez **Publier** quand l'article est prêt.

### 3.1 — « Consultation sur les orientations stratégiques »

**Onglet Contenu**

- **Titre**

```
Consultation sur les orientations stratégiques : ce que le CSE peut réellement exiger
```

- **Chapô**

```
Chaque année, l'employeur doit consulter le CSE sur ses orientations stratégiques. Derrière cette obligation de forme se joue un vrai levier : le délai, les documents transmis et la possibilité de recourir à un expert. Mode d'emploi.
```

- **Image mise en avant** : l'image décrite au § 1.
- **Corps de l'article**

```
[Paragraphe] La consultation sur les orientations stratégiques est l'une des trois consultations récurrentes du CSE. C'est aussi la plus souvent expédiée : un diaporama présenté en séance, deux questions, un avis rendu dans la foulée. Rien n'oblige les élus à procéder ainsi.

[Titre 2] Un délai qui ne commence pas quand l'employeur le dit

[Paragraphe] Le point de départ du délai de consultation n'est pas la date de la réunion, mais celle de la mise à disposition des informations nécessaires. Tant que les documents manquent, le délai ne court pas — à condition de l'avoir écrit.

[Liste à puces]
Demandez par écrit, avant la réunion, les documents que vous jugez manquants.
Faites porter cette demande au procès-verbal.
Rappelez en séance que le délai ne court qu'à compter de leur réception.

[Encadré — Bon à savoir] À défaut d'accord, le CSE dispose d'un mois pour rendre son avis, porté à deux mois en cas de recours à un expert. Ce délai est un maximum, pas un minimum : rien n'interdit de rendre un avis dès la première réunion si le dossier est complet.

[Titre 2] Quels documents demander

[Titre 3] Le socle

[Paragraphe] La base de données économiques, sociales et environnementales doit contenir les éléments pluriannuels. Si elle n'est pas à jour, la consultation est fragilisée : commencez par là.

[Titre 3] Ce qui se négocie

[Liste numérotée]
Le plan de charge prévisionnel par site ou par activité.
Les hypothèses d'effectifs retenues pour les trois exercices à venir.
Les projets d'investissement et leur financement.
Les conséquences envisagées sur l'emploi et les compétences.

[Titre 2] L'expert, un moyen et pas une menace

[Paragraphe] Le CSE peut se faire assister d'un expert-comptable pour cette consultation. Le financement est partagé : 20 % sur le budget de fonctionnement du comité, 80 % par l'employeur. Annoncer l'expertise tôt évite de perdre le délai utile.

[Citation] Un avis motivé qui pointe trois angles morts du dossier pèse plus lourd, dans un contentieux ultérieur, que dix avis défavorables sans justification.

[Encadré — À retenir] Trois réflexes : écrire les demandes de documents, vérifier la date réelle de départ du délai, décider du recours à l'expert dès la première réunion.

[Titre 2] Et si l'employeur passe outre

[Paragraphe] Un avis rendu sans information suffisante peut être contesté devant le président du tribunal judiciaire, qui statue en procédure accélérée. Le juge peut ordonner la communication des éléments manquants et prolonger le délai.
```

**Onglet Classement**

- **Catégorie** : `Négociation`
- **Tags** : `Consultation`, `Procédure`, `Mandat`

**Barre latérale**

- **Type** : `Article de fond`
- **Date de publication** : `08/10/2026 09:00`
- **À la une (page d'accueil)** : cochée
- **Temps de lecture** : laissé vide, il se calcule au premier enregistrement
- **Slug attendu** : `consultation-sur-les-orientations-strategiques-ce-que-le-cse-peut-reellement-exiger`

**Onglet SEO** — cliquez sur « Générer » pour le titre et la description, puis
vérifiez que le titre se termine bien par « — Infos Élus ».

### 3.2 — « Le local du CSE »

- **Titre**

```
Local, matériel, affichage : les moyens que l'employeur doit au CSE
```

- **Chapô**

```
Un local, du mobilier, un accès à l'affichage : les moyens matériels du CSE ne sont pas une faveur de l'employeur. Ce qu'il doit fournir, ce qui se négocie, et comment réagir quand le local se réduit à une armoire dans un couloir.
```

- **Corps de l'article**

```
[Paragraphe] L'employeur doit mettre à la disposition du CSE un local aménagé et le matériel nécessaire à l'exercice de ses fonctions. La loi s'arrête là : tout le reste se joue dans la négociation et dans la preuve de ce qui manque.

[Titre 2] Ce qui est dû, sans discussion

[Liste à puces]
Un local, clos, dédié au comité et accessible aux élus.
Du mobilier permettant de recevoir un salarié et de conserver des archives.
Un accès à l'affichage sur les emplacements réservés aux représentants du personnel.

[Titre 2] Ce qui se négocie

[Paragraphe] Ligne téléphonique dédiée, poste informatique, accès à l'intranet, boîte mail du comité, armoire fermant à clé : rien de tout cela n'est explicitement imposé, mais l'ensemble découle du droit à exercer le mandat. Un accord de fonctionnement est le bon véhicule.

[Encadré — Attention] Un local partagé avec un service de l'entreprise pose un problème de confidentialité : les échanges avec les salariés et les documents du comité ne peuvent pas être exposés. C'est l'argument le plus solide pour obtenir un espace dédié.

[Titre 2] Quand le local se dégrade

[Liste numérotée]
Constatez par écrit, avec date et photos, ce qui manque ou ne fonctionne plus.
Inscrivez le point à l'ordre du jour de la réunion suivante.
Demandez une réponse écrite et un délai de mise en conformité.
À défaut, saisissez l'inspection du travail, puis le juge en référé.

[Citation] Un local sans porte qui ferme n'est pas un local : c'est un couloir avec une table.

[Encadré — À retenir] Les moyens matériels se documentent comme un dossier : écrit, daté, porté au procès-verbal. C'est cette trace qui rend la demande opposable.
```

- **Catégorie** : `Vie du mandat`
- **Tags** : `Moyens du CSE`, `Mandat`
- **Type** : `Article de fond`
- **Date de publication** : `06/10/2026 08:30`
- **À la une** : cochée
- **Slug attendu** : `local-materiel-affichage-les-moyens-que-l-employeur-doit-au-cse`

---

## 4. Actualités

Même collection **Articles**, champ **Type** = `Actualité`. La case de la barre
latérale change : c'est **Grand format (actualité)**, et une seule actualité
peut la porter — la cocher ici décoche automatiquement les autres.

### 4.1 — « Télétravail » (à passer en grand format)

- **Titre**

```
Télétravail : l'accord d'entreprise devient obligatoire pour fixer les jours imposés
```

- **Chapô**

```
Un employeur ne peut plus imposer unilatéralement des jours de télétravail collectifs sans passer par un accord ou, à défaut, une charte soumise au CSE. La consultation du comité redevient le passage obligé.
```

- **Corps de l'actualité**

```
[Paragraphe] Le texte publié cette semaine resserre le cadre : les jours de télétravail imposés à un collectif de salariés relèvent désormais de l'accord d'entreprise, ou d'une charte élaborée après consultation du CSE.

[Titre 2] Ce qui change concrètement

[Liste à puces]
Les notes de service unilatérales fixant des jours fixes deviennent contestables.
Le CSE doit être consulté sur la charte, et son avis figurer au procès-verbal.
Les accords existants restent valables jusqu'à leur terme.

[Encadré — Bon à savoir] Si votre entreprise fonctionne aujourd'hui par simple note de service, demandez l'inscription du point à l'ordre du jour de la prochaine réunion : c'est le moment d'ouvrir la négociation.

[Paragraphe] Les élus ont intérêt à documenter la pratique réelle avant d'entrer en négociation : nombre de jours effectifs, répartition par service, équipements fournis.
```

- **Catégorie** : `Négociation`
- **Tags** : `Négociation`, `Consultation`
- **Type** : `Actualité`
- **Date de publication** : `07/10/2026 07:30`
- **Grand format (actualité)** : cochée
- **Slug attendu** : `teletravail-l-accord-d-entreprise-devient-obligatoire-pour-fixer-les-jours-imposes`

### 4.2 — « Subvention de fonctionnement »

- **Titre**

```
Subvention de fonctionnement : le transfert vers les ASC plafonné à 10 % de l'excédent
```

- **Chapô**

```
Le comité qui dégage un excédent sur son budget de fonctionnement peut en reverser une partie aux activités sociales et culturelles. Le plafond et les mentions obligatoires au procès-verbal sont précisés.
```

- **Corps de l'actualité**

```
[Paragraphe] Le transfert d'excédent du budget de fonctionnement vers celui des activités sociales et culturelles reste possible, dans la limite de 10 % de l'excédent constaté à la clôture de l'exercice.

[Titre 2] Les conditions à respecter

[Liste numérotée]
Délibérer en séance plénière, et non par simple décision du trésorier.
Faire figurer le montant et sa destination au procès-verbal.
Reporter le transfert dans les comptes annuels du comité.

[Encadré — Attention] Un transfert décidé sans délibération expose les élus en cas de contrôle : la trace au procès-verbal n'est pas une formalité, c'est la preuve de la décision collective.
```

- **Catégorie** : `Budget`
- **Tags** : `Budget`, `Procédure`
- **Type** : `Actualité`
- **Date de publication** : `02/10/2026 08:00`
- **Grand format** : décochée
- **Slug attendu** : `subvention-de-fonctionnement-le-transfert-vers-les-asc-plafonne-a-10-de-l-excedent`

---

## 5. Guide

Collection **Guides**. Le corps n'est pas un bloc unique : chaque **section**
porte son titre et son contenu, et alimente le sommaire interne. L'**ancre** est
en lecture seule, elle se dérive du titre de section.

**Onglet Contenu**

- **Titre**

```
Négocier un accord d'entreprise : méthode pour les élus de CSE
```

- **Résumé court**

```
Préparer le mandat, construire un rapport de force, lire un projet d'accord ligne à ligne et savoir quand signer. Les quatre étapes d'une négociation menée par des élus, avec les pièges les plus fréquents.
```

- **Image mise en avant** : l'image décrite au § 1.

**Sections** — ajoutez-en quatre, dans cet ordre.

### Section 1

- **Titre de la section** : `Avant d'entrer en séance`
- **Ancre attendue** : `avant-d-entrer-en-seance`
- **Contenu**

```
[Paragraphe] Une négociation se gagne surtout avant la première réunion. Trois éléments doivent être arrêtés en interne : ce que vous demandez, ce que vous êtes prêts à lâcher, et la limite en dessous de laquelle vous ne signez pas.

[Liste à puces]
Écrivez vos revendications par ordre de priorité, chiffrées quand c'est possible.
Identifiez une ou deux contreparties acceptables, décidées collectivement.
Fixez la ligne rouge avant la séance, pas pendant.

[Encadré — Bon à savoir] Demandez par écrit le calendrier des séances et les documents préparatoires dès la convocation. Un calendrier connu permet de préparer chaque étape ; un calendrier imposé séance après séance met la délégation en réaction permanente.
```

### Section 2

- **Titre de la section** : `Lire un projet d'accord`
- **Ancre attendue** : `lire-un-projet-d-accord`
- **Contenu**

```
[Paragraphe] Un projet d'accord se lit deux fois : une fois pour le fond, une fois pour les articles qui n'ont l'air de rien — durée, dénonciation, révision, date d'entrée en vigueur.

[Liste numérotée]
Vérifiez le champ d'application : quels établissements, quelles catégories de salariés.
Repérez la durée et le mode de dénonciation.
Traquez les renvois à une « note de service ultérieure » : ce qui n'est pas dans l'accord n'est pas négocié.
Contrôlez les clauses de suivi : commission, périodicité, documents remis.

[Citation] Une clause de suivi sans périodicité ni destinataire est une clause décorative.
```

### Section 3

- **Titre de la section** : `Construire le rapport de force`
- **Ancre attendue** : `construire-le-rapport-de-force`
- **Contenu**

```
[Paragraphe] Le rapport de force se construit avec les salariés, pas seulement en séance. L'information régulière de l'atelier ou du service concerné vaut souvent mieux qu'un argument juridique supplémentaire.

[Liste à puces]
Informez les salariés à chaque étape, même quand il n'y a rien à annoncer.
Faites remonter les situations concrètes : elles rendent la revendication lisible.
Affichez les comptes rendus de séance sur les emplacements réservés.

[Encadré — Attention] Ne diffusez pas de document remis comme confidentiel sans avoir vérifié le fondement de cette mention : la confidentialité doit être justifiée, mais la contester se fait par écrit, pas par la diffusion.
```

### Section 4

- **Titre de la section** : `Signer, ou ne pas signer`
- **Ancre attendue** : `signer-ou-ne-pas-signer`
- **Contenu**

```
[Paragraphe] La décision de signature se prend au regard de la ligne rouge fixée au départ, et non de la fatigue de la dernière séance. Une non-signature motivée et expliquée aux salariés n'est pas un échec.

[Liste numérotée]
Comparez le texte final à vos priorités écrites, point par point.
Mesurez ce qui est acquis, ce qui est renvoyé à plus tard, ce qui est perdu.
Décidez collectivement, en réunion, et formalisez la décision.
Expliquez le choix aux salariés, quelle que soit la décision.

[Encadré — À retenir] Préparation écrite, lecture des clauses techniques, information continue des salariés, décision collective : les quatre appuis d'une négociation tenue.
```

**Onglet Ressources** — deux entrées. Les fichiers PDF créés par `npm run seed`
sont réutilisables, ou prenez n'importe quel PDF.

| Intitulé                                  | Description                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| `Grille de préparation d'une négociation` | `Tableau à remplir avant la première séance : revendications, contreparties, ligne rouge.` |
| `Modèle de compte rendu de séance`        | `Compte rendu type à afficher après chaque réunion de négociation.`                        |

**Onglet Classement**

- **Thème** : `Négociation collective`
- **Tags** : `Négociation`, `Procédure`, `Mandat`

**Barre latérale**

- **Date de publication** : `05/10/2026 10:00`
- **Mettre en avant sur l'accueil** : cochée
- **Slug attendu** : `negocier-un-accord-d-entreprise-methode-pour-les-elus-de-cse`

---

## 6. Quiz

Collection **Quiz**. Contrainte de validation à connaître : **chaque question
doit avoir au moins deux réponses et exactement une réponse correcte**. Un quiz
incomplet s'enregistre en brouillon mais refuse de se publier.

**Onglet Contenu**

- **Titre**

```
Négociation collective : testez vos réflexes d'élu
```

- **Introduction**

```
Cinq questions sur la négociation d'entreprise : qui peut négocier, dans quels délais, et ce qu'un accord peut vraiment contenir. Comptez trois minutes.
```

- **Thème** : `Négociation collective`
- **Semaine de publication** : `05/10/2026` (un lundi — le quiz mis en avant est
  le plus récent dont la semaine est arrivée)

**Onglet Questions** — cinq questions.

### Question 1

- **Énoncé**

```
Dans une entreprise dotée de délégués syndicaux, qui signe un accord d'entreprise ?
```

- **Réponses** (la bonne est marquée ✅)

| Intitulé                                                   | Réponse correcte |
| ---------------------------------------------------------- | ---------------- |
| `Les délégués syndicaux des organisations représentatives` | ✅               |
| `Le secrétaire du CSE`                                     | —                |
| `L'ensemble des élus titulaires du CSE`                    | —                |
| `Le trésorier du CSE, après délibération`                  | —                |

- **Explication**

```
En présence de délégués syndicaux, la négociation et la signature leur reviennent. Le CSE est consulté dans les cas prévus par la loi, mais il ne signe pas l'accord.
```

- **Points** : `1`

### Question 2

- **Énoncé**

```
À défaut d'accord sur les délais, de combien de temps dispose le CSE pour rendre un avis lorsqu'il recourt à un expert ?
```

| Intitulé       | Réponse correcte |
| -------------- | ---------------- |
| `Deux mois`    | ✅               |
| `Quinze jours` | —                |
| `Un mois`      | —                |
| `Trois mois`   | —                |

- **Explication**

```
Le délai de droit commun est d'un mois, porté à deux mois en cas de recours à un expert. Un accord peut l'allonger, mais pas le réduire en dessous de quinze jours.
```

- **Points** : `1`

### Question 3

- **Énoncé**

```
Le délai de consultation du CSE commence à courir à partir de quel moment ?
```

| Intitulé                                                | Réponse correcte |
| ------------------------------------------------------- | ---------------- |
| `De la mise à disposition des informations nécessaires` | ✅               |
| `De l'envoi de la convocation`                          | —                |
| `De la tenue de la première réunion`                    | —                |
| `De la demande d'avis formulée par l'employeur`         | —                |

- **Explication**

```
C'est la mise à disposition des informations nécessaires qui déclenche le délai. D'où l'intérêt de signaler par écrit, et au procès-verbal, les documents manquants.
```

- **Points** : `2`

### Question 4

- **Énoncé**

```
Quelle part du coût d'une expertise sur les orientations stratégiques reste à la charge du CSE ?
```

| Intitulé                                                    | Réponse correcte |
| ----------------------------------------------------------- | ---------------- |
| `20 %, sur le budget de fonctionnement`                     | ✅               |
| `Rien : l'employeur finance la totalité`                    | —                |
| `50 %, partagés à parts égales`                             | —                |
| `20 %, sur le budget des activités sociales et culturelles` | —                |

- **Explication**

```
Le financement est partagé : 20 % sur le budget de fonctionnement du comité, 80 % par l'employeur. Le budget des activités sociales et culturelles ne peut pas servir à cela.
```

- **Points** : `1`

### Question 5

- **Énoncé**

```
Un accord d'entreprise peut-il être moins favorable qu'une convention de branche ?
```

| Intitulé                                                  | Réponse correcte |
| --------------------------------------------------------- | ---------------- |
| `Oui, sauf dans les matières verrouillées par la branche` | ✅               |
| `Non, jamais`                                             | —                |
| `Oui, sans aucune limite`                                 | —                |
| `Uniquement avec l'accord écrit de chaque salarié`        | —                |

- **Explication**

```
L'accord d'entreprise primait depuis les ordonnances de 2017, sauf dans les domaines que la branche verrouille — classifications, salaires minima, mutualisation des fonds, prévoyance, pénibilité, égalité professionnelle notamment.
```

- **Points** : `2`

**Barre latérale** — **Date de publication** : `05/10/2026 09:00`
**Slug attendu** : `negociation-collective-testez-vos-reflexes-d-elu`

---

## 7. Prestataires

Collection **Prestataires**. Pas de brouillon ici : la fiche n'apparaît dans
l'annuaire public que si **Visible sur le site** est cochée. Le site web exige
une URL complète avec `https://`, sinon le champ refuse la saisie.

### 7.1 — Formation

| Champ                   | Valeur                                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Nom**                 | `Boussole Élus`                                                                                                                    |
| **Description courte**  | `Formation économique et santé-sécurité des élus de CSE, en présentiel sur site ou à distance, par sessions de deux à cinq jours.` |
| **Catégorie**           | `Formation`                                                                                                                        |
| **Zone d'intervention** | `France entière`                                                                                                                   |
| **Nom du contact**      | `Service inscriptions`                                                                                                             |
| **Email**               | `inscriptions@boussole-elus.example`                                                                                               |
| **Téléphone**           | `01 84 23 55 10`                                                                                                                   |
| **Site web**            | `https://boussole-elus.example`                                                                                                    |
| **Visible sur le site** | cochée                                                                                                                             |
| **Slug attendu**        | `boussole-elus`                                                                                                                    |

**Présentation** (éditeur allégé : Titre 3, gras, listes, liens, citation —
ni image ni encadré)

```
[Paragraphe] Boussole Élus forme les membres de CSE depuis leur premier mandat jusqu'au renouvellement. Les sessions se construisent à partir des dossiers réels du comité : consultation en cours, budget à voter, enquête à mener.

[Titre 3] Catalogue

[Liste à puces]
Formation économique des élus (cinq jours, agrément en cours de renouvellement).
Santé, sécurité et conditions de travail (trois ou cinq jours selon l'effectif).
Lire et voter les comptes du comité (deux jours).
Préparer les élections professionnelles (une journée).

[Titre 3] Modalités

[Paragraphe] Sessions inter-entreprises à Paris, Lyon et Nantes, ou intra sur site à partir de six participants. Les supports restent accessibles aux élus pendant la durée du mandat.
```

### 7.2 — Assistance juridique

| Champ                   | Valeur                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Nom**                 | `Avocats du Mandat`                                                                                                                  |
| **Description courte**  | `Cabinet dédié aux instances représentatives : consultations, contentieux du CSE et assistance en cas de projet de restructuration.` |
| **Catégorie**           | `Assistance juridique`                                                                                                               |
| **Zone d'intervention** | `Île-de-France`, `Hauts-de-France`, `Grand Est`                                                                                      |
| **Nom du contact**      | `Maître Hélène Brémont`                                                                                                              |
| **Email**               | `contact@avocats-du-mandat.example`                                                                                                  |
| **Téléphone**           | `03 20 14 77 02`                                                                                                                     |
| **Site web**            | `https://avocats-du-mandat.example`                                                                                                  |
| **Visible sur le site** | cochée                                                                                                                               |
| **Slug attendu**        | `avocats-du-mandat`                                                                                                                  |

**Présentation**

```
[Paragraphe] Le cabinet intervient exclusivement aux côtés des élus et de leurs organisations syndicales, en conseil comme en contentieux.

[Titre 3] Interventions

[Liste à puces]
Consultation écrite sur un projet d'accord ou une procédure d'information-consultation.
Référé en cas d'absence d'information ou de délai contesté.
Assistance du comité dans une procédure de licenciement collectif.
Contentieux électoral.

[Citation] Une question posée avant la réunion coûte moins cher qu'un contentieux après l'avis.
```

### 7.3 — Billetterie & ASC

| Champ                   | Valeur                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Nom**                 | `Comptoir Loisirs & Culture`                                                                                            |
| **Description courte**  | `Billetterie en ligne pour les comités : cinéma, spectacles, parcs et séjours, avec suivi des subventions par salarié.` |
| **Catégorie**           | `Billetterie & ASC`                                                                                                     |
| **Zone d'intervention** | `France entière`                                                                                                        |
| **Nom du contact**      | `Karim Aït-Saïd`                                                                                                        |
| **Email**               | `comites@comptoir-loisirs.example`                                                                                      |
| **Téléphone**           | `04 72 90 18 44`                                                                                                        |
| **Site web**            | `https://comptoir-loisirs.example`                                                                                      |
| **Visible sur le site** | cochée                                                                                                                  |
| **Slug attendu**        | `comptoir-loisirs-culture`                                                                                              |

**Présentation**

```
[Paragraphe] Plateforme de billetterie réservée aux comités, avec un espace par salarié et un tableau de bord pour le trésorier.

[Titre 3] Fonctionnement

[Liste numérotée]
Le comité fixe le montant de la subvention et les plafonds par salarié.
Les salariés commandent depuis leur espace, subvention déduite.
Le comité reçoit une facture mensuelle unique et l'export comptable.
```

### 7.4 — Fiche à laisser en attente (test du filtre public)

Créez une quatrième fiche en laissant **Visible sur le site** décochée, pour
vérifier qu'elle n'apparaît pas dans `/prestataires` :

| Champ                   | Valeur                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **Nom**                 | `Atelier Fiche en Attente`                                                          |
| **Description courte**  | `Fiche de test laissée non publiée pour vérifier le filtrage de l'annuaire public.` |
| **Catégorie**           | `Événementiel`                                                                      |
| **Zone d'intervention** | `Occitanie`                                                                         |
| **Visible sur le site** | décochée                                                                            |

---

## 8. Témoignages

Collection **Témoignages** (accueil, à côté du bloc newsletter). La citation est
limitée à 220 caractères et les guillemets sont ajoutés à l'affichage : ne les
saisissez pas.

| Citation                                                                                                                                                      | Auteur          | Mandat                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------- |
| `J'ai pris mon premier mandat sans rien connaître au droit du travail. Les guides m'ont surtout appris quelles questions poser avant une réunion.`            | `Nadia B.`      | `Élue suppléante, 180 salariés`   |
| `Le rappel du délai de consultation nous a évité de rendre un avis sur un dossier incomplet. On a demandé les documents par écrit, et le calendrier a bougé.` | `Un élu de CSE` | `Secrétaire de CSE, 240 salariés` |
| `Le quiz du lundi est devenu un rituel de la commission. On compare les scores, puis on parle de la question qu'on a tous ratée.`                             | `Thomas L.`     | `Trésorier de CSE, 90 salariés`   |

---

## 9. Newsletter et quiz : à tester côté site, pas dans l'admin

Deux collections ne se remplissent **pas** à la main.

- **Abonnés** — passez par le formulaire du site (`/newsletter` ou le bloc de
  l'accueil). Le double opt-in impose un clic sur le lien reçu par email : ne
  basculez jamais le statut sur « Confirmé » depuis l'admin, ce serait inscrire
  quelqu'un sans son consentement. Adresses de test :
  `elu.test+un@example.com`, `elu.test+deux@example.com`.
  En développement, le lien de confirmation s'affiche dans la sortie de
  `npm run dev` si aucun service d'envoi n'est configuré.
- **Résultats de quiz** — ils s'écrivent quand un visiteur joue le quiz sur
  `/jeux-quiz/<slug>`. Jouez-le une fois en vous trompant volontairement sur la
  question 3 pour vérifier l'explication et le score.

---

## 10. Vérifications une fois tout saisi

| Page                                                                   | Ce qui doit apparaître                                                                                                  |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `/`                                                                    | Les deux articles « à la une », le guide mis en avant dans le rail « Guides CSE », le quiz de la semaine, un témoignage |
| `/actualite`                                                           | « Télétravail » en grand format, « Subvention de fonctionnement » dans « Les autres actualités »                        |
| `/articles`                                                            | Les deux articles de fond, filtrables par catégorie et par tag                                                          |
| `/guides`                                                              | Le guide, filtrable par thème (`Négociation collective`)                                                                |
| `/guides/negocier-un-accord-d-entreprise-methode-pour-les-elus-de-cse` | Sommaire à quatre entrées, ancres fonctionnelles, deux ressources en fin de page                                        |
| `/jeux-quiz`                                                           | Le quiz de la semaine du 5 octobre                                                                                      |
| `/prestataires`                                                        | Trois fiches, pas la quatrième ; filtres catégorie et région opérants                                                   |
| `/recherche?q=négociation`                                             | L'article et le guide remontent (la recherche couvre les articles, l'actualité et les guides, pas les quiz)             |

Dernier contrôle, après toute saisie de taxonomie ou de contenu :

```bash
npx tsc --noEmit
```
