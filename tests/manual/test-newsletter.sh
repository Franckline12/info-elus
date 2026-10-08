#!/usr/bin/env bash
#
# Test de bout en bout du parcours newsletter (étape 7, double opt-in § 4.4).
#
#   ./test-newsletter.sh votre-adresse-de-test@exemple.com
#
# Prérequis : le serveur de dev tourne (npm run dev), le conteneur
# `infos-elus-db` est démarré, et `.env` contient les identifiants Brevo.
#
# Ce que le script NE peut pas vérifier à votre place, et qui est rappelé à la
# fin : l'arrivée réelle des emails dans votre boîte, leur rendu, et l'affichage
# de l'admin Payload.
#
# Les étapes envoient volontairement un en-tête X-Forwarded-For différent à
# chaque fois : sans cela, la limitation de débit (5 demandes par quart d'heure
# et par IP) couperait le test en cours de route. Une étape dédiée, elle, garde
# la même IP pour vérifier que la limite fonctionne.

set -uo pipefail

EMAIL="${1:-}"
BASE="${BASE:-http://localhost:3000}"
CONTAINER="${CONTAINER:-infos-elus-db}"
DB_USER="${DB_USER:-infos_elus_user}"
DB_NAME="${DB_NAME:-infos_elus}"

if [ -z "$EMAIL" ]; then
  echo "Usage : $0 <adresse-email-de-test>" >&2
  exit 2
fi

# Racine du projet : celle qui porte package.json et .env, quel que soit le
# dossier depuis lequel le script est lancé.
find_project_dir() {
  local dir
  dir="$(cd "$(dirname "$0")" && pwd)"
  while [ "$dir" != "/" ]; do
    [ -f "$dir/package.json" ] && { echo "$dir"; return; }
    dir="$(dirname "$dir")"
  done
  echo "$PWD"
}

PROJECT_DIR="${PROJECT_DIR:-$(find_project_dir)}"
cd "$PROJECT_DIR" || exit 2

HONEYPOT_EMAIL="robot-test@exemple.fr"
PASS=0
FAIL=0
STEP=0

bold() { printf '\033[1m%s\033[0m\n' "$1"; }

# Vérifie une valeur attendue et affiche le verdict.
check() {
  local label="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    printf '  \033[32m✓\033[0m %s\n' "$label"
    PASS=$((PASS + 1))
  else
    printf '  \033[31m✗\033[0m %s\n      attendu : %s\n      obtenu  : %s\n' "$label" "$expected" "$actual"
    FAIL=$((FAIL + 1))
  fi
}

# Vérifie qu'une chaîne est absente d'une autre (test de fuite de données).
check_absent() {
  local label="$1" needle="$2" haystack="$3"
  if [[ "$haystack" != *"$needle"* ]]; then
    printf '  \033[32m✓\033[0m %s\n' "$label"
    PASS=$((PASS + 1))
  else
    printf '  \033[31m✗\033[0m %s — la valeur « %s » apparaît dans la réponse\n' "$label" "$needle"
    FAIL=$((FAIL + 1))
  fi
}

step() {
  STEP=$((STEP + 1))
  bold ""
  bold "── $STEP. $1"
}

db() { docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tAc "$1" 2>/dev/null | tr -d '\r'; }

BODY_FILE="$(mktemp)"
trap 'rm -f "$BODY_FILE"' EXIT

# Pose le code HTTP dans $CODE et le corps dans $BODY. Surtout ne pas appeler
# cette fonction dans un `$( )` : le sous-shell perdrait les deux variables.
CODE=""
BODY=""
call() {
  local method="$1" url="$2" ip="$3" data="${4:-}"
  local attempt
  for attempt in 1 2; do
    if [ -n "$data" ]; then
      CODE=$(curl -s -m 60 -o "$BODY_FILE" -w '%{http_code}' -X "$method" "$url" \
        -H 'content-type: application/json' -H "x-forwarded-for: $ip" -d "$data")
    else
      CODE=$(curl -s -m 60 -o "$BODY_FILE" -w '%{http_code}' -X "$method" "$url" \
        -H "x-forwarded-for: $ip")
    fi
    # 000 = pas de réponse (compilation d'une route en dev, par exemple).
    [ "$CODE" != "000" ] && break
    sleep 2
  done
  BODY=$(cat "$BODY_FILE")
}

subscribe() { call POST "$BASE/api/newsletter/subscribe" "$1" "$2"; }

brevo() {
  local path="$1"
  local key
  key=$(grep -E '^BREVO_API_KEY=' "$PROJECT_DIR/.env" | cut -d= -f2- | tr -d '"'"'"'')
  [ -z "$key" ] && { echo '{"error":"BREVO_API_KEY absente de .env"}'; return; }
  curl -s -m 30 "https://api.brevo.com/v3/$path" -H "api-key: $key" -H 'accept: application/json'
}

bold "Test du parcours newsletter — $EMAIL"
echo "Serveur : $BASE   Base : $CONTAINER/$DB_NAME"

# Table rase pour cette adresse : le test doit partir d'une situation connue.
db "delete from subscribers where email in ('$EMAIL', '$HONEYPOT_EMAIL');" >/dev/null

step "Le serveur répond"
call GET "$BASE/" 198.51.100.1
check "GET / renvoie 200" 200 "$CODE"

step "Une adresse mal formée est refusée (400) sans rien écrire"
subscribe 198.51.100.2 '{"email":"pas-une-adresse"}'
check "code HTTP" 400 "$CODE"
check "aucune ligne créée" 0 "$(db "select count(*) from subscribers where email = 'pas-une-adresse';")"

step "Le champ piège fait répondre comme un succès, sans inscrire personne"
subscribe 198.51.100.3 "{\"email\":\"$HONEYPOT_EMAIL\",\"website\":\"http://spam.example\"}"
check "code HTTP" 200 "$CODE"
check "aucune ligne créée" 0 "$(db "select count(*) from subscribers where email = '$HONEYPOT_EMAIL';")"

step "Cas 1 — adresse inconnue : création en attente + email de confirmation"
subscribe 198.51.100.4 "{\"email\":\"$EMAIL\",\"source\":\"/test\"}"
check "code HTTP" 200 "$CODE"
SUCCESS_BODY="$BODY"
check "statut en base" "pending" "$(db "select status from subscribers where email = '$EMAIL';")"
check "jeton de confirmation présent" "t" "$(db "select confirmation_token is not null from subscribers where email = '$EMAIL';")"
check "jeton de désinscription présent" "t" "$(db "select unsubscribe_token is not null from subscribers where email = '$EMAIL';")"
check "validité à 7 jours" "7" "$(db "select round(extract(epoch from (token_expires_at - subscribed_at)) / 86400)::int from subscribers where email = '$EMAIL';")"
check "page d'origine enregistrée" "/test" "$(db "select source from subscribers where email = '$EMAIL';")"
TOKEN_1=$(db "select confirmation_token from subscribers where email = '$EMAIL';")

step "Cas 2 — adresse déjà en attente : nouveau jeton, nouvel email"
subscribe 198.51.100.5 "{\"email\":\"$EMAIL\"}"
check "code HTTP" 200 "$CODE"
check "réponse identique au cas 1" "$SUCCESS_BODY" "$BODY"
TOKEN_2=$(db "select confirmation_token from subscribers where email = '$EMAIL';")
check "le jeton a changé" "different" "$([ "$TOKEN_1" != "$TOKEN_2" ] && echo different || echo identique)"
check "toujours en attente" "pending" "$(db "select status from subscribers where email = '$EMAIL';")"

step "L'ancien jeton ne vaut plus rien"
call GET "$BASE/api/newsletter/confirm?token=$TOKEN_1" 198.51.100.6
check "code HTTP" 404 "$CODE"

step "Un jeton inventé est refusé"
call GET "$BASE/api/newsletter/confirm?token=jeton-invente-de-toutes-pieces" 198.51.100.7
check "code HTTP" 404 "$CODE"

step "Confirmation avec le bon jeton"
call GET "$BASE/api/newsletter/confirm?token=$TOKEN_2" 198.51.100.8
check "code HTTP" 200 "$CODE"
check "réponse" '{"status":"confirmed","message":"Votre inscription est confirmée."}' "$BODY"
check "statut en base" "confirmed" "$(db "select status from subscribers where email = '$EMAIL';")"
check "date de consentement enregistrée" "t" "$(db "select confirmed_at is not null from subscribers where email = '$EMAIL';")"
check "jeton effacé (usage unique)" "t" "$(db "select confirmation_token is null from subscribers where email = '$EMAIL';")"

step "Le lien de confirmation ne resservira pas"
call GET "$BASE/api/newsletter/confirm?token=$TOKEN_2" 198.51.100.9
check "code HTTP" 404 "$CODE"

step "Le contact est arrivé dans la liste Brevo"
CONTACT=$(brevo "contacts/$(printf %s "$EMAIL" | sed 's/@/%40/;s/+/%2B/')")
UNSUB_TOKEN=$(db "select unsubscribe_token from subscribers where email = '$EMAIL';")
check "contact présent dans la liste 3" "oui" "$(echo "$CONTACT" | grep -q '"listIds":\[3\]' && echo oui || echo "non — $CONTACT")"
check "attribut UNSUB_TOKEN synchronisé" "oui" "$(echo "$CONTACT" | grep -qF "$UNSUB_TOKEN" && echo oui || echo non)"

step "Cas 3 — adresse déjà confirmée : aucune trace, aucun email"
subscribe 198.51.100.10 "{\"email\":\"$EMAIL\"}"
check "code HTTP" 200 "$CODE"
check "réponse identique au cas 1" "$SUCCESS_BODY" "$BODY"
check "toujours confirmée" "confirmed" "$(db "select status from subscribers where email = '$EMAIL';")"
check "aucun nouveau jeton émis (donc aucun email)" "t" "$(db "select confirmation_token is null from subscribers where email = '$EMAIL';")"

step "Désinscription en un clic"
call POST "$BASE/api/newsletter/unsubscribe" 198.51.100.11 "{\"token\":\"$UNSUB_TOKEN\"}"
check "code HTTP" 200 "$CODE"
check "réponse" '{"status":"unsubscribed","message":"Votre désinscription est enregistrée."}' "$BODY"
check "statut en base" "unsubscribed" "$(db "select status from subscribers where email = '$EMAIL';")"
check "date enregistrée" "t" "$(db "select unsubscribed_at is not null from subscribers where email = '$EMAIL';")"

step "Deuxième clic sur le même lien : pas d'erreur, pas de double traitement"
call POST "$BASE/api/newsletter/unsubscribe" 198.51.100.12 "{\"token\":\"$UNSUB_TOKEN\"}"
check "code HTTP" 200 "$CODE"
check "réponse" '{"status":"already-unsubscribed","message":"Cette adresse est déjà désinscrite."}' "$BODY"

step "Le contact est sorti de la liste Brevo"
CONTACT=$(brevo "contacts/$(printf %s "$EMAIL" | sed 's/@/%40/;s/+/%2B/')")
check "plus dans aucune liste" "oui" "$(echo "$CONTACT" | grep -q '"listIds":\[\]' && echo oui || echo "non — $CONTACT")"

step "Cas 4 — adresse désinscrite : retour en attente, nouvel email"
subscribe 198.51.100.13 "{\"email\":\"$EMAIL\"}"
check "code HTTP" 200 "$CODE"
check "réponse identique au cas 1" "$SUCCESS_BODY" "$BODY"
check "repassée en attente" "pending" "$(db "select status from subscribers where email = '$EMAIL';")"
check "nouveau jeton émis" "t" "$(db "select confirmation_token is not null from subscribers where email = '$EMAIL';")"

step "Un jeton expiré est refusé (410), distinctement d'un jeton inconnu (404)"
db "update subscribers set token_expires_at = now() - interval '1 hour' where email = '$EMAIL';" >/dev/null
TOKEN_3=$(db "select confirmation_token from subscribers where email = '$EMAIL';")
call GET "$BASE/api/newsletter/confirm?token=$TOKEN_3" 198.51.100.14
check "code HTTP" 410 "$CODE"
check "statut inchangé" "pending" "$(db "select status from subscribers where email = '$EMAIL';")"

step "Limitation de débit : 6 demandes depuis la même IP"
# IP tirée au hasard : le compteur vit 15 minutes dans la mémoire du serveur,
# deux exécutions rapprochées du test se marcheraient sinon sur les pieds.
LOAD_IP="203.0.113.$(( (RANDOM % 240) + 10 ))"
echo "      IP de charge : $LOAD_IP"
CODES=""
for i in 1 2 3 4 5 6; do
  subscribe "$LOAD_IP" "{\"email\":\"charge$i@exemple.fr\"}"
  CODES="$CODES $CODE"
done
echo "      codes obtenus :$CODES"
FIRST_FIVE=$(echo "$CODES" | awk '{print $1, $2, $3, $4, $5}')
check "aucun refus sur les 5 premières" "oui" "$([[ "$FIRST_FIVE" != *429* ]] && echo oui || echo non)"
check "la 6e est refusée (429)" "429" "$CODE"
RETRY=$(curl -s -m 60 -o /dev/null -D - -X POST "$BASE/api/newsletter/subscribe" \
  -H 'content-type: application/json' -H "x-forwarded-for: $LOAD_IP" \
  -d '{"email":"charge7@exemple.fr"}' | grep -i '^retry-after:' | tr -d '\r' | awk '{print $2}')
check "en-tête Retry-After présent" "oui" "$([ -n "$RETRY" ] && echo oui || echo non)"

step "RGPD — la liste d'abonnés ne fuit par aucune API publique"
call GET "$BASE/api/subscribers?limit=100" 198.51.100.15
check "REST /api/subscribers refuse" 403 "$CODE"
check_absent "aucune adresse dans la réponse REST" "$EMAIL" "$BODY"
call POST "$BASE/api/graphql" 198.51.100.16 '{"query":"{ Subscribers { docs { email status confirmationToken } } }"}'
check_absent "aucune adresse dans la réponse GraphQL" "$EMAIL" "$BODY"
check_absent "aucun jeton dans la réponse GraphQL" "$TOKEN_3" "$BODY"

step "Purge des inscriptions non confirmées et périmées"
db "delete from subscribers where email like 'charge%@exemple.fr';" >/dev/null
BEFORE=$(db "select count(*) from subscribers where email = '$EMAIL';")
check "l'adresse expirée est encore là avant la purge" 1 "$BEFORE"
(cd "$PROJECT_DIR" && npm run purge:subscribers 2>&1 | grep -E 'adresse\(s\) supprimée' | sed 's/^/      /')
check "supprimée par la purge" 0 "$(db "select count(*) from subscribers where email = '$EMAIL';")"

bold ""
bold "──────────────────────────────────────────────"
printf '  \033[32m%d réussis\033[0m, ' "$PASS"
if [ "$FAIL" -eq 0 ]; then printf '\033[32m0 échec\033[0m\n'; else printf '\033[31m%d échec(s)\033[0m\n' "$FAIL"; fi
bold "──────────────────────────────────────────────"

cat <<MANUEL

À vérifier à la main, ce qu'un script ne peut pas faire :

  1. Votre boîte $EMAIL doit contenir 3 emails « Confirmez votre inscription à la
     lettre Infos Élus » (cas 1, cas 2 et cas 4). Vérifiez l'expéditeur, le
     rendu du bouton ocre, le lien texte de repli, et la mention « Si vous
     n'êtes pas à l'origine de cette demande ».
  2. Affichez la version texte brut (Gmail : « Afficher l'original ») : elle
     doit être lisible et contenir le lien.
  3. Aucun quatrième email ne doit être arrivé pour le cas 3 (adresse déjà
     confirmée) ni pour le champ piège.
  4. Dans l'admin Payload, Données → Abonnés : les colonnes email / statut /
     date, et AUCUNE colonne ni champ de jeton visible à l'ouverture d'un
     abonné.
  5. Le lien reçu par email tombe pour l'instant sur un 404 : la page
     /newsletter/confirmation est l'objet de la partie B.
MANUEL

[ "$FAIL" -eq 0 ] || exit 1
