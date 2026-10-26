# Projet Angular — Web app Île-de-France Mobilités

> Mis à jour le 2026-10-26 après exploration du portail PRIM
> (https://prim.iledefrance-mobilites.fr/fr/catalogue-data?type=api).
> Détail du catalogue : voir aussi `PRIM-API-infos.md`.

## Idée

Web app qui exploite les **API d'Île-de-France Mobilités (PRIM)** pour aider à se déplacer en IDF :
chercher un lieu, calculer un itinéraire, voir les prochains passages, suivre le trafic et garder ses favoris.

**Défaut connu** : IDFM et Citymapper font déjà tout ça. On tente quand même, mais il faut un **angle
distinctif** (voir « Se démarquer » plus bas).

Scénario du sujet : on est une startup qui présente la **v1** de son appli au CEO (le prof), à la
responsable marketing et au reste de la classe.

## Cadre imposé (Projet.pdf)

| Point | Règle |
|---|---|
| Objectif | Site Angular qui communique avec une API / un backend |
| Groupe | 1 ou 2 personnes |
| Options back | 1) développer son back, 2) **utiliser une API en ligne** (notre choix), 3) mocker une API en JSON (MirageJS) |
| Design | Libre : **Bootstrap** ou **Angular Material** autorisés, **template tout fait interdit** |
| Fonctionnalités | **Minimum 5**, à **faire valider par le prof**. Chacune doit **impliquer un appel API**. Mieux vaut peu de fonctionnalités bien faites que beaucoup bâclées |
| Rendu | **01/12/2026 à 23h59 max** |
| Démo | **02/12/2026**, 15 min max, **sans code à montrer**, interruptible par la classe, doit rester fonctionnelle |
| Notation | Projet : coef 2 /20 — Démo : coef 1 /20 |
| Nommage | Projet Angular **et** dépôt git : `projet-nomduprojet-prénom1-prénom2` |
| Git | Ajouter le prof au dépôt (merge requests, conseils, questions) |
| Organisation | Faire un listing de tâches et le faire valider par le prof (chef de projet = libre) |
| CORS | Si blocage sur une API en ligne : activer l'accès sur https://cors-anywhere.herokuapp.com/corsdemo (bouton) |

Docs conseillées : https://angular.io/ · https://getbootstrap.com/ · https://material.angular.io/

## Ce que dit le portail PRIM (vérifié le 2026-10-26)

### Accès et authentification

- Compte PRIM obligatoire, puis page **« Mes jetons d'authentification »** → onglet API → **« Générer mon jeton »**.
- Le jeton n'est **visible en entier qu'une seule fois** : le copier tout de suite (régénérer le rend l'ancien obsolète).
- Un **seul jeton** sert pour toutes les API.
- Il s'envoie dans l'**en-tête HTTP `apiKey`** de chaque requête.
- Doc : https://prim.iledefrance-mobilites.fr/fr/aide-et-contact/documentation/donnees-disponibles/api/generer-un-jeton-pour-acceder-aux-api

### API Calculateur IDFM — Accès générique (v2) (Navitia)

- Page : https://prim.iledefrance-mobilites.fr/fr/apis/idfm-navitia-general-v2
- **Host** : `https://prim.iledefrance-mobilites.fr` — **Base path** : `/marketplace/v2/navitia`
- Sert à : recherche de lieux, recherche d'itinéraires, horaires théoriques, calcul d'itinéraires.
- Réponses JSON **paginées** (`start_page`, `count` ; max **1000** éléments par réponse, **200** pour `/places`).
- Doc technique : http://doc.navitia.io ; un **Navitia playground** est proposé (nécessite le jeton).
- Endpoints Navitia standard à confirmer dans le playground : `/places?q=`, `/journeys?from=&to=&datetime=`, `/stop_areas/{id}/departures`.
- Identifiants d'objets : `IDFM:xxxxx` (ex. `IDFM:70604` = Porte de Choisy pour un `stop_area`, `IDFM:C01371` = Métro 1 pour une route). Attention : les `stop_point` de **bus changent chaque jour** (publication du GTFS), ceux du ferré sont stables → **stocker en favori le `stop_area`**, pas le `stop_point`.

### API Calculateur IDFM — Messages Info Trafic (v2) (Navitia)

- Page : https://prim.iledefrance-mobilites.fr/fr/apis/idfm-navitia-line_reports-v2
- Perturbations (incidents, travaux prévus ou non), **par ligne ou par mode**, en JSON.
- Paginé, max **100** résultats par réponse.
- Alternative : **Messages Info Trafic – Requête globale** (tout le réseau d'un coup, réponse volumineuse).

### API Prochains passages — requête unitaire (temps réel)

- Page : https://prim.iledefrance-mobilites.fr/fr/apis/idfm-ivtr-requete_unitaire
- Point d'entrée affiché : `GET /stop-monitoring/{MonitoringRef}` (chemin exact à confirmer dans l'assistant requêtage une fois connecté).
- Format **SIRI Lite** (JSON), licence Mobilité / ODbL.
- Temps réel disponible seulement sur **une partie du réseau**. Liste des arrêts couverts : jeu de données **« Périmètre des données temps réel disponibles »**.
- Identifiants à utiliser (**différents** de ceux du Calculateur !) :
  - Arrêt/quai : `STIF:StopPoint:Q:[id]:` (un quai = **un seul sens**)
  - Zone d'arrêts : `STIF:StopArea:SP:[id]:` — **à privilégier** (depuis le 13/03/2025 la SNCF n'est dispo que par zone d'arrêts)
  - Ligne (paramètre optionnel) : `STIF:Line::C01727:` (ex. RER C)
- ⚠️ Ne pas utiliser la requête **globale** (`LineRef=ALL`) : réponse énorme, compressée, inutilisable depuis un navigateur.

### Quotas (important !)

| API | Ancien jeton (avant 13/03/2024) | Nouveau jeton (13/03 → sept. 2024) |
|---|---|---|
| Calculateur (générique) | 10 req/s, 20 000 req/jour | **5 req/s, 1 000 req/jour** |
| Prochains passages (unitaire) | 100 req/s, 1 000 000 req/jour | **5 req/s, 1 000 req/jour** |

- Notre jeton sera récent : **prévoir 5 req/s et 1 000 req/jour** par API, et vérifier sur la page « Ma consommation API » (où l'on peut aussi demander plus de quota).
- Conséquences pour le code :
  - **Autocomplétion** : `debounceTime(300–400 ms)`, minimum 3 caractères, `distinctUntilChanged`, annulation avec `switchMap`
  - **Cache** des réponses (Map en mémoire / `shareReplay`) pour ne pas redemander la même chose
  - Rafraîchir les prochains passages avec un intervalle raisonnable (30–60 s), jamais en rafale
  - Ne **pas** faire de tests en boucle : 1 000 req/jour partent vite en développement
- Bonne pratique PRIM : lisser les requêtes dans le temps, envoyer `Accept-Encoding: gzip, deflate`.

### CORS : test fait, ça passe

Test depuis une page tierce (`example.com`), sans clé :
- `https://prim.iledefrance-mobilites.fr/marketplace/v2/navitia/places?q=…` → **401** lisible par le navigateur, y compris avec un en-tête `apiKey` (donc la requête préliminaire CORS est acceptée)
- `https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets` (portail Open Data, **sans clé**) → **200** lisible

→ **Pas besoin de cors-anywhere ni de proxy** a priori. À reconfirmer avec la vraie clé depuis `localhost:4200`.

## Fonctionnalités (5 minimum, à faire valider par le prof)

Chacune implique un appel API, comme exigé.

1. **Recherche de lieux** — autocomplétion d'adresses, arrêts et gares (Calculateur, `places`)
2. **Calcul d'itinéraire** — départ → arrivée, date/heure, trajets avec étapes, durée, correspondances (Calculateur, `journeys`)
3. **Prochains passages** — sur un arrêt, en temps réel (API Prochains passages, SIRI Lite)
4. **Infos trafic** — perturbations par ligne ou par mode (Messages Info Trafic)
5. **Favoris** — enregistrer lieux, arrêts et trajets ; la page favoris **rafraîchit via l'API** les prochains passages et l'état du trafic (stockage `localStorage`, ou JSON Server si on veut un vrai back)

### Se démarquer (à trancher ensemble puis présenter au prof)

Le catalogue PRIM contient des jeux de données que ni Citymapper ni l'appli IDFM ne mettent vraiment en avant.
Angle proposé : **« se déplacer mieux »** (accessibilité, confort, impact) plutôt qu'un calculateur de plus.

| Idée | Données PRIM | Appel API ? |
|---|---|---|
| **Trajet accessible** : afficher l'état des ascenseurs sur les stations d'un trajet | « État des ascenseurs » (connexion requise, mis à jour quotidiennement) + « Accessibilité en gare » | Via le portail Open Data (API Opendatasoft `explore/v2.1`, sans CORS à contourner) — à vérifier |
| **Empreinte CO2** d'un trajet | « Émission de CO2e par voyageur-km » (facteurs par mode, ceux utilisés par IDFM) | Calcul côté appli à partir des modes renvoyés par `journeys` |
| **Où se placer dans la rame** pour sa sortie | « Positionnement dans la rame » (RATP) | Open Data, à vérifier |
| Confort : qualité de l'air, fontaines près des arrêts | « Qualité de l'air », « Fontaines à proximité des arrêts » | Open Data, à vérifier |
| Intermodal : parking relais, vélos | « Parking relais », Vélib', Geovelo | Open Data / API tierces |

Règle : ces enrichissements se **branchent sur les 5 fonctionnalités** (ex. l'itinéraire affiche l'accessibilité et le CO2) plutôt que d'ajouter des pages isolées. Une idée bien faite vaut mieux que quatre à moitié.

### À faire / à vérifier avant de coder

- [ ] Créer le compte PRIM, **générer le jeton** (le copier une seule fois !) et souscrire aux API nécessaires
- [ ] Tester `places` et `journeys` dans le **playground Navitia** avec le jeton
- [ ] Tester `stop-monitoring` sur un arrêt couvert (consulter « Périmètre des données temps réel »)
- [ ] Relever dans « Ma consommation API » les **quotas réels** de notre jeton
- [ ] Vérifier le **CORS depuis `localhost:4200`** avec la vraie clé
- [ ] Vérifier que les jeux de données de différenciation sont interrogeables par l'API Open Data (`data.iledefrance-mobilites.fr`)
- [ ] **Sécurité de la clé** : visible dans le navigateur. Acceptable pour un projet de cours : la mettre dans `environment.ts`, **ne pas la commiter**, fournir un `environment.example.ts`
- [ ] **Plan B** (mock JSON / MirageJS) si l'API est indisponible ou le quota épuisé le jour de la démo (surveillance : page « État des API » de PRIM)

## Notions Angular à couvrir (« toucher à toutes les bases »)

- Composants, templates, `@Input` / `@Output`, cycle de vie
- **Routing** (accueil, recherche, résultats, arrêt, trafic, favoris) + paramètres de route + lazy loading
- **Services** et injection de dépendances ; `HttpClient`
- **RxJS** (`switchMap`, `debounceTime`, `catchError`, `shareReplay`, `timer`/`interval` pour le rafraîchissement)
- **Formulaires réactifs** avec validation (recherche d'itinéraire)
- **Interceptor HTTP** : ajoute le header `apiKey`, gère les erreurs globales (401, 429 quota dépassé)
- Pipes (dates, durées, pipe maison), directives
- Signals / état partagé pour les favoris
- Guards éventuels, états chargement / erreur / vide, **interfaces TypeScript** pour les réponses Navitia et SIRI

## Design

- **Bootstrap ou Angular Material** pour les composants, mais **mise en page et identité à nous** (pas de template prêt à l'emploi ; ne pas utiliser non plus le widget « Marque-Grise » d'IDFM)
- Couleurs des lignes IDFM reprises depuis les données de l'API
- Responsive (usage mobile très probable pour une appli de transport)

## Organisation

- Dépôt : `projet-<nomduprojet>-<prénom1>-<prénom2>` — **nom du projet à choisir** ; y ajouter le prof
- Branche de travail + merge requests, jamais de commit direct sur `main`
- Backlog de tâches à faire valider par le prof (une tâche = une fonctionnalité ou un composant)

### Planning proposé (rendu le 01/12, démo le 02/12)

| Période | Objectif |
|---|---|
| Sem. du 26/10 | Compte PRIM + jeton, tests playground, choix du nom et de l'angle, création du dépôt, validation des fonctionnalités par le prof |
| Sem. du 02/11 | Squelette Angular, routing, service API + interceptor, recherche de lieux (avec debounce et cache) |
| Sem. du 09/11 | Itinéraires |
| Sem. du 16/11 | Prochains passages |
| Sem. du 23/11 | Infos trafic + favoris + enrichissement « se démarquer » |
| 24/11 → 30/11 | Finitions design, gestion d'erreurs, tests, plan B mock, préparation de la démo |
| **01/12 23h59** | **Rendu** |
| **02/12** | **Démo (15 min)** |

## Démo (15 min, sans code)

- Scénario fil rouge : « je cherche un trajet, je vois l'accessibilité et le CO2, je regarde les prochains passages, je vérifie le trafic, j'enregistre en favori »
- Prévoir des recherches qui marchent à coup sûr (arrêts couverts en temps réel) et un plan B si le réseau ou l'API tombe
- **Garder du quota** pour le jour J (ne pas épuiser les 1 000 req/jour la veille)
- Se répartir la parole si on est deux, garder de la marge pour les questions de la classe
