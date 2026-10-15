# Recette manuelle — Actualité (§ 2.3)

Parcours de vérification à la main de la rubrique Actualité : le fil `/actualite`,
les pages `/actualite/[slug]`, et les règles portées par le back-office.

Compter une vingtaine de minutes. Chaque étape est indépendante, sauf l'étape 2
qui prépare l'étape 3.

## Prérequis

```bash
docker compose up -d        # conteneur infos-elus-db
npm run dev                 # http://localhost:3000
npm run seed                # 6 actualités de démonstration
```

Un compte d'administration est nécessaire : celui que tu utilises d'habitude sur
`http://localhost:3000/admin`.

Les libellés cités sont ceux de l'admin en français. Les étapes 2 à 6 modifient
le jeu de démonstration ; `npm run seed` le remet à plat (étape 10).

---

## 1. Le fil se lit dans l'ordre, sans filtre

**Tu fais** — ouvre `http://localhost:3000/actualite`.

**Tu dois voir**

- Un **grand format** en tête : « Chèques-cadeaux : l'URSSAF actualise son barème
  de tolérance pour les ASC », badge « À la une », grande image, chapô complet.
- Ce n'est **pas** la plus récente du lot (celle du 6 octobre est « Contestation
  des élections »). C'est normal : la case « Grand format » prime sur la date.
- En dessous, « Les autres actualités » : 5 entrées de la plus récente à la plus
  ancienne (06/10, 24/09, 17/09, 10/09, 03/09), séparées par des **filets fins** —
  pas de cartes arrondies, pas d'ombres.
- Chaque entrée : vignette, catégorie, titre, chapô **tronqué à deux lignes**,
  date puis temps de lecture.
- La dernière (« Document unique ») n'a **pas de vignette** : la ligne reste
  alignée, elle ne casse pas la grille. C'est volontaire dans le seed.
- **Aucun panneau de filtre** : ni « Filtrer par catégorie », ni « Tags
  populaires ». Un fil se lit dans l'ordre ; les filtres sont sur `/articles`.
- Clique une catégorie (le badge bleu) : elle mène à `/articles?categorie=…`,
  donc aux articles de fond du même sujet.

## 2. Le « Grand format » est exclusif

**Tu fais**

1. Admin → **Contenus** → **Articles** → ouvre « Contestation des élections du CSE ».
2. Dans la colonne de droite, coche **Grand format (actualité)**.
3. Clique **Publier les modifications**.

**Tu dois voir**

- Recharge `/actualite` : le grand format est maintenant « Contestation des
  élections », et « Chèques-cadeaux » est redescendue dans la liste.
- Rouvre « Chèques-cadeaux » dans l'admin : la case **Grand format** s'est
  décochée toute seule, et le document affiche toujours **Statut : Publié**.
  C'est le point important : décocher ne doit jamais dépublier.

## 3. Publier met le fil à jour immédiatement

**Tu fais**

1. Admin → **Articles** → **Créer**.
2. Colonne de droite : passe **Type** à **Actualité**. _(La case « Grand format »
   n'apparaît qu'après ce choix : elle est conditionnée au type.)_
3. Onglet **Contenu** : saisis un **Titre**, un **Chapô**, un **Corps de l'article**
   d'un ou deux paragraphes.
4. Onglet **Classement** : choisis une **Catégorie** (obligatoire) et un ou deux tags.
5. **Publier les modifications**.

**Tu dois voir**

- Le **Slug** s'est rempli tout seul à partir du titre, en minuscules sans accents.
- **Temps de lecture (min)** s'est calculé tout seul, en lecture seule.
- `/actualite` : la nouvelle actualité est **en tête de la liste** (sa date est
  celle du jour), sans avoir à redémarrer le serveur ni vider un cache.
- Ouvre-la : fil d'Ariane **Accueil › Actualité › titre** (trois niveaux, pas de
  catégorie intercalée), la date est écrite en toutes lettres « Publié le … » et
  passe avant le temps de lecture.

## 4. Un brouillon n'atteint jamais le site

**Tu fais** — dans l'actualité de l'étape 3, change le titre et **ne publie pas**.
Attends deux secondes : l'enregistrement automatique (autosave) travaille seul.

**Tu dois voir**

- `/actualite` et la page de l'actualité affichent toujours **l'ancien titre**.
- L'admin indique une version brouillon en attente.
- Clique **Publier les modifications** : le nouveau titre apparaît sur le site.

## 5. Changer le slug purge l'ancienne URL

**Tu fais** — note l'URL de ton actualité, change son **Slug** dans la colonne de
droite, puis **Publier les modifications**.

**Tu dois voir**

- La **nouvelle** URL répond.
- L'**ancienne** URL renvoie une 404 aux couleurs du site — elle ne continue pas
  à servir l'ancienne version depuis le cache.

## 6. Une actualité n'est pas un article de fond

**Tu fais** — ouvre `http://localhost:3000/actualite/subvention-de-fonctionnement-la-cour-de-cassation-precise-l-assiette-de-calcul`
(c'est le slug d'un article de fond, pas d'une actualité).

**Tu dois voir** — une **404**. Les deux types partagent la même collection, mais
chaque URL n'accepte que le sien.

**Tu fais ensuite** — reprends ton actualité de l'étape 3 et passe son **Type** à
**Article de fond**, puis publie.

**Tu dois voir** — elle disparaît de `/actualite`, apparaît sur `/articles`, et son
ancienne URL `/actualite/<slug>` renvoie 404.

## 7. L'accueil raconte la même chose que la rubrique

**Tu fais** — ouvre `http://localhost:3000/`.

**Tu dois voir** — une section **Actualité** avec **exactement le même grand format**
que `/actualite` et les **3 actualités suivantes**, dans le même ordre, suivie du
lien « Voir toute l'actualité ». Si les deux divergent, c'est un bug.

## 8. La pagination

Avec 6 actualités et une limite de 10 par page, la pagination ne s'affiche pas.
Pour la voir :

**Tu fais** — dans `src/app/(frontend)/actualite/page.tsx`, passe `PER_PAGE` de
`10` à `2`, puis recharge `/actualite`.

**Tu dois voir**

- Page 1 : le grand format **+ 2 entrées**, et une pagination en bas.
- Clique « 2 » : l'URL devient `/actualite?page=2`, **le grand format disparaît**
  (il n'ouvre que la première page), et la liste continue sans répéter ni sauter
  d'actualité.
- Ce sont de vrais liens : clic droit → « Ouvrir dans un nouvel onglet » marche,
  et chaque page est partageable.

Remets `PER_PAGE` à `10` ensuite.

## 9. Clavier et accessibilité

**Tu fais** — depuis le haut de `/actualite`, parcours la page à la touche `Tab`.

**Tu dois voir**

- Un **contour de focus visible** sur chaque élément atteint.
- Dans le menu, « Actualité » est marqué actif (couleur + filet sous le libellé),
  aussi bien sur `/actualite` que sur une page `/actualite/<slug>`.
- Les vignettes ne piègent pas le focus : l'image et le titre mènent au même
  endroit, mais seul le titre est atteignable au clavier.

## 10. Remise à zéro

```bash
npm run seed
```

Les 6 actualités de démonstration sont recréées à l'identique, le grand format
revient sur « Chèques-cadeaux ». Les contenus que tu as créés toi-même à l'étape 3
ne sont pas supprimés : fais-le depuis l'admin (**…** → **Supprimer**).
