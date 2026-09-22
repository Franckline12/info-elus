# Cahier des charges — Infos Élus

### Média spécialisé CSE — Site web

Version 1.0 — Septembre 2026
Document destiné au développeur en charge de l'intégration et du développement.
Maquette de référence : `infos-elus-maquette.html`

---

## 1. Présentation du projet

Infos Élus est un média web dédié aux élus du Comité Social et Économique (CSE). Le site diffuse de l'information juridique et pratique sur le droit du travail et le fonctionnement du CSE, met en relation les élus avec un réseau de prestataires, et propose des formats ludiques (quiz) pour ancrer les connaissances.

**Valeurs du projet :** partage (communauté d'élus, contenu remonté du terrain) et éducation (vulgarisation juridique accessible, sans jargon).

**Cible :** élus titulaires et suppléants de CSE, tous mandats confondus (secrétaire, trésorier, référent harcèlement, représentant syndical), dans des entreprises de toutes tailles.

---

## 2. Périmètre fonctionnel

### 2.1 Articles

- Liste d'articles filtrable par catégorie (Négociation, Santé & sécurité, Budget, Élections, etc.) et par date.
- Page article : titre, chapô (dek), corps de texte riche (titres, listes, citations, images, encadrés), métadonnées (temps de lecture, date de publication, date de mise à jour).
- Articles "à la une" pouvant être mis en avant manuellement sur la page d'accueil (cf. section Actualité de la maquette).
- Recherche plein texte sur le corpus d'articles.

### 2.2 Guides CSE

- Fiches longues, structurées par thème (Élections, Budget & finances, Santé & sécurité, Négociation — thématiques extensibles).
- Chaque guide : titre, résumé court, contenu structuré (sommaire interne, sections), éventuellement des ressources téléchargeables (modèles, PV type).
- Présentation en rail horizontal sur la page d'accueil (cf. maquette, section "Guides CSE") + page listing dédiée avec filtre par thème.

### 2.3 Actualité

- Fil d'actualité juridique et CSE, chronologique.
- Un article "feature" (grand format) + une liste secondaire, comme sur la maquette.
- Système de tags réutilisé entre Articles, Guides et Actualité (taxonomie commune, cf. 5.1).

### 2.4 Réseau de prestataires

- Annuaire de prestataires classés par catégorie (Formation, Assistance juridique, Comptabilité & audit, Billetterie & ASC, Événementiel).
- Fiche prestataire : nom, description, catégorie, zone d'intervention, coordonnées/lien de contact.
- Formulaire de mise en relation ou de référencement (à préciser avec le client — voir section 8).

### 2.5 Jeux & Quiz

- Quiz hebdomadaire de culture générale sur le droit du travail et le fonctionnement du CSE.
- Format : questions à choix multiples, feedback immédiat (bonne/mauvaise réponse), score en fin de parcours.
- Affichage d'un compteur communautaire (nombre de parties jouées, taux de bonnes réponses) comme sur la maquette.
- Historique des quiz passés, rejouables.
- Non prioritaire pour la V1 mais à prévoir dans le modèle de données : classement/leaderboard entre élus d'un même CSE.

### 2.6 Partage / Newsletter

- Formulaire d'inscription à une lettre hebdomadaire (email).
- Double opt-in obligatoire (conformité RGPD, cf. 4.4).
- Bloc "témoignage d'élu" en rotation possible.

### 2.7 Fonctionnalités transverses

- Recherche globale (articles + guides + actualité).
- Système de tags/catégories partagé entre les contenus.
- Fil d'Ariane sur les pages de contenu.
- Partage sur réseaux sociaux depuis les pages article/guide.

---

## 3. Arborescence indicative

```
/                          Accueil
/actualite/                Liste actualité
/actualite/[slug]          Article
/guides/                   Liste des guides
/guides/[slug]             Guide
/jeux-quiz/                Liste des quiz
/jeux-quiz/[slug]          Quiz (parcours de jeu)
/prestataires/             Annuaire
/prestataires/[slug]       Fiche prestataire
/a-propos/                 Présentation du média / partage
/mentions-legales/
/confidentialite/
```

---

## 4. Spécifications techniques

### 4.1 Stack recommandé

- **CMS headless ou traditionnel** permettant à une équipe non technique de publier articles, guides et quiz sans intervention développeur (ex. gestion de contenu type Sanity, Strapi, WordPress selon préférence du client — à valider).
- **Frontend** : le rendu de la maquette fournie (`infos-elus-maquette.html`) est en HTML/CSS/JS vanilla ; à réintégrer dans le framework retenu (à discuter : Next.js si CMS headless, ou thème natif si CMS traditionnel).
- **Responsive** : breakpoints à 900px (tablette) et 600px (mobile), déjà implémentés dans la maquette — menu principal en accordéon sous 900px.

### 4.2 Modèle de données (entités principales)

| Entité            | Champs clés                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Article           | titre, chapô, corps, catégorie, tags[], date_publication, date_maj, temps_lecture, image_mise_en_avant, article_a_la_une (bool) |
| Guide             | titre, résumé, thème, corps structuré, ressources_téléchargeables[], tags[]                                                     |
| Quiz              | titre, thème, questions[] (énoncé, options[], bonne_réponse, points), date_publication                                          |
| Question quiz     | énoncé, options[], index_bonne_réponse, explication (optionnel)                                                                 |
| Prestataire       | nom, catégorie, description, zone_intervention, contact, logo                                                                   |
| Abonné newsletter | email, date_inscription, statut_confirmation (double opt-in)                                                                    |
| Tag/Catégorie     | libellé, slug, utilisé_par[] (article/guide/actualité)                                                                          |

### 4.3 Performance & SEO

- Rendu SSR ou SSG pour les pages de contenu (articles, guides) — indexation SEO prioritaire, le trafic organique étant un canal d'acquisition attendu pour ce type de média.
- Balises meta (title, description, Open Graph) éditables par contenu depuis le CMS.
- Temps de chargement cible : LCP < 2,5s sur mobile.
- Sitemap XML généré automatiquement, flux RSS pour l'actualité (souhaitable).

### 4.4 RGPD & conformité

- Double opt-in sur le formulaire newsletter.
- Bandeau de consentement cookies si outils de mesure d'audience tiers.
- Pages Mentions légales et Confidentialité à intégrer (contenu à fournir par le client).

### 4.5 Accessibilité

- Focus clavier visible sur tous les éléments interactifs (nav, formulaires, options de quiz).
- Contraste texte/fond conforme AA (les couleurs de la maquette ont été choisies dans cet objectif — à revérifier après intégration finale).
- Alternatives textuelles sur les images.

---

## 5. Identité visuelle (extraite de la maquette)

### 5.1 Couleurs

| Usage                                | Variable                 | Valeur    |
| ------------------------------------ | ------------------------ | --------- |
| Fond papier                          | `--color-paper`          | `#F3F0E6` |
| Fond papier surélevé (cartes)        | `--color-paper-raised`   | `#FBFAF4` |
| Texte principal                      | `--color-ink`            | `#10152B` |
| Texte secondaire                     | `--color-text-secondary` | `#565C78` |
| Bleu profond (header/footer/quiz)    | `--color-blue-deep`      | `#12193B` |
| Bleu moyen                           | `--color-blue-mid`       | `#24356F` |
| Bleu vif (liens/CTA)                 | `--color-blue-bright`    | `#3E63E0` |
| Bleu pâle (fonds légers)             | `--color-blue-pale`      | `#E4E9FB` |
| Accent Jeux & Quiz (usage restreint) | `--color-accent-quiz`    | `#E3A23E` |

### 5.2 Typographie

- Police système : Roc Grotesk (police sous licence — à fournir par le client) pour titres et texte courant.
- Repli web utilisé dans la maquette : Space Grotesk (Google Fonts) en attendant l'intégration de la police sous licence.
- Police secondaire pour chapôs/citations : Source Serif 4 (registre éditorial).
- Échelle de tailles et graisses : voir variables CSS `--font-size-*` et `--font-weight-*` dans le fichier de maquette.

### 5.3 Principes de mise en page

- Traitement éditorial (masthead, filets fins) plutôt que cartes SaaS arrondies avec ombre.
- Un seul accent hors-bleu (ocre), réservé exclusivement à la section Jeux & Quiz.
- Les guides sont catégorisés par couleur de bordure (thème), pas par numérotation.

---

## 6. Intégrations tierces à prévoir

- Outil d'envoi de newsletter (ex. Brevo, Mailchimp — à valider avec le client).
- Outil de mesure d'audience (à définir).
- Éventuel outil de sondage/quiz si le moteur n'est pas développé en interne.

---

## 7. Livrables attendus du développeur

1. Intégration responsive fidèle à la maquette fournie (desktop / tablette / mobile).
2. CMS configuré avec les modèles de contenu de la section 4.2.
3. Moteur de quiz fonctionnel (saisie de questions côté CMS, restitution du score côté front).
4. Formulaire newsletter avec double opt-in.
5. Documentation technique de déploiement et de prise en main du CMS pour l'équipe éditoriale.

---

## 8. Points ouverts à valider avec le client avant développement

- Choix définitif du CMS/back-office.
- Logo définitif (la maquette utilise un logotype texte provisoire).
- Contenu définitif des premiers articles, guides et quiz (la maquette contient des exemples fictifs).
- Modalités du formulaire prestataires : simple annuaire en lecture seule, ou formulaire de référencement/mise en relation ?
- Ajout ou non d'un calendrier d'événements CSE (fonctionnalité évoquée pour Infos Élus mais non intégrée dans cette maquette).
- Police Roc Grotesk : disponibilité de la licence webfont ou maintien du repli Space Grotesk.

---

## 9. Planning indicatif

| Phase             | Contenu                                                                 | Durée estimée |
| ----------------- | ----------------------------------------------------------------------- | ------------- |
| 1 — Cadrage       | Validation du présent cahier des charges, choix du CMS                  | —             |
| 2 — Intégration   | Développement des gabarits (accueil, article, guide, quiz, prestataire) | —             |
| 3 — CMS & contenu | Configuration des modèles de contenu, formation de l'équipe éditoriale  | —             |
| 4 — Recette       | Tests fonctionnels, responsive, accessibilité, SEO                      | —             |
| 5 — Mise en ligne | Déploiement, DNS, suivi post-lancement                                  | —             |

_Durées à compléter selon la disponibilité du développeur retenu._
