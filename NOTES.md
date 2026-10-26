# Projet Angular — Web app Île-de-France Mobilités

> Mis à jour le 2026-10-26. Sources : `Projet.pdf` (consignes) et catalogue PRIM
> (https://prim.iledefrance-mobilites.fr/fr/catalogue-data?type=api).

## Idée

Web app qui exploite les **API d'Île-de-France Mobilités (PRIM)** pour aider à se déplacer en IDF :
chercher un lieu, calculer un itinéraire, voir les prochains passages, suivre le trafic et garder ses favoris.

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

## API PRIM retenues

Le catalogue PRIM liste 15 API (plus des jeux de données). Celles qui servent le projet :

| Besoin | API PRIM | Remarque |
|---|---|---|
| Recherche de lieux + itinéraires + horaires théoriques | **Calculateur Île-de-France Mobilités – Accès générique (v2)** (Navitia) | API principale, couvre 3 fonctionnalités |
| Prochains passages temps réel | **Prochains passages – requête unitaire** (à un arrêt) ou **requête ligne** | Temps réel disponible seulement sur une partie du réseau |
| Perturbations / trafic | **Calculateur IDFM – Messages Info Trafic (v2)** ou **Messages Info Trafic – Requête globale** | Par ligne ou par mode |
| Bonus possible | **Isochrones (v2)** (accessibilité en X minutes), **Vélib'** (dispo vélos), **Geovelo** (itinéraire vélo) | Seulement si le temps le permet |

Toutes sont marquées **« connexion requise »** : il faut un compte PRIM et une **clé API**
(header `apiKey`).

### À faire / à vérifier avant de coder

- [ ] Créer un compte PRIM, souscrire aux API ci-dessus et récupérer la clé
- [ ] Lire la doc technique de chaque API sur le portail (URL de base, paramètres, quotas — non vérifiés pour l'instant)
- [ ] Vérifier le **CORS** : les appels directs depuis le navigateur passent-ils ? Sinon utiliser le contournement cors-anywhere du sujet ou un mini proxy
- [ ] **Sécurité de la clé** : une clé dans le code Angular est visible côté navigateur. Acceptable pour un projet de cours (la mettre dans `environment.ts`, ne **pas** la commiter, fournir un `environment.example.ts`)
- [ ] Prévoir un **plan B** (mock JSON / MirageJS) si l'API est instable ou si les quotas posent problème le jour de la démo

## Fonctionnalités (5 minimum, à valider avec le prof)

Chacune implique un appel API, comme exigé.

1. **Recherche de lieux** — autocomplétion d'adresses, arrêts et gares (API Calculateur, `places`)
2. **Calcul d'itinéraire** — départ → arrivée, date/heure, liste de trajets avec étapes, durée, correspondances (API Calculateur, `journeys`)
3. **Prochains passages / horaires** — sur un arrêt, temps réel quand dispo (API Prochains passages ou Calculateur `departures`)
4. **Infos trafic** — perturbations en cours par ligne ou par mode (API Messages Info Trafic)
5. **Favoris** — enregistrer lieux, arrêts et trajets ; la page favoris **rafraîchit via l'API** les prochains passages / l'état du trafic des favoris (stockage `localStorage`, ou JSON server si on veut un vrai back)

Pistes si on veut aller plus loin (une seule à la fois, bien finie) :
- Carte interactive (Leaflet) avec arrêts et tracé de l'itinéraire
- Isochrones (« où aller en 30 min depuis ici »)
- Historique des recherches, mode sombre, géolocalisation « autour de moi »
- Authentification simple (si on ajoute un petit back pour les favoris)

> À soumettre au prof pour validation : la liste ci-dessus, en précisant que « Favoris » est lié à
> l'API par le rafraîchissement des horaires/trafic.

## Notions Angular à couvrir (« toucher à toutes les bases »)

- Composants, templates, `@Input` / `@Output`, cycle de vie
- **Routing** (pages : accueil, recherche, résultats, arrêt, trafic, favoris) + paramètres de route + lazy loading
- **Services** et injection de dépendances ; `HttpClient`
- **RxJS** (`switchMap`, `debounceTime`, `catchError`…) pour l'autocomplétion
- **Formulaires réactifs** avec validation (recherche d'itinéraire)
- **Interceptor HTTP** pour ajouter le header `apiKey` et gérer les erreurs globalement
- Pipes (dates, durées, pipe maison), directives
- Signals / état partagé pour les favoris
- Guards éventuels, gestion des états chargement / erreur / vide

## Design

- **Bootstrap ou Angular Material** pour les composants, mais **mise en page et identité à nous** (pas de template prêt à l'emploi)
- Couleurs des lignes IDFM (métro, RER, tram, bus) reprises depuis les données de l'API
- Responsive (usage mobile très probable pour une appli de transport)

## Organisation

- Dépôt : `projet-<nomduprojet>-<prénom1>-<prénom2>` — **nom du projet à choisir** ; y ajouter le prof
- Branche de travail + merge requests, jamais de commit direct sur `main`
- Backlog de tâches à faire valider par le prof (une tâche = une fonctionnalité ou un composant)

### Planning proposé (rendu le 01/12, démo le 02/12)

| Période | Objectif |
|---|---|
| Sem. du 26/10 | Compte PRIM + clé, test des API (Postman / navigateur), choix du nom, création du dépôt, validation des fonctionnalités par le prof |
| Sem. du 02/11 | Squelette Angular, routing, service API + interceptor, recherche de lieux |
| Sem. du 09/11 | Itinéraires |
| Sem. du 16/11 | Prochains passages / horaires |
| Sem. du 23/11 | Infos trafic + favoris |
| 24/11 → 30/11 | Finitions design, gestion d'erreurs, tests, plan B mock, préparation de la démo |
| **01/12 23h59** | **Rendu** |
| **02/12** | **Démo (15 min)** |

## Démo (15 min, sans code)

- Scénario fil rouge : « je cherche un trajet, je regarde les prochains passages, je vérifie le trafic, j'enregistre en favori »
- Prévoir des données/recherches qui marchent à coup sûr, et un plan B si le réseau ou l'API tombe
- Se répartir la parole si on est deux, garder de la marge pour les questions de la classe
