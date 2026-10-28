# Projet Angular — Se déplacer en Île-de-France

Application web **Angular** qui s'appuie sur les API d'[Île-de-France Mobilités (PRIM)](https://prim.iledefrance-mobilites.fr) pour aider à se déplacer en Île-de-France : chercher un lieu, calculer un itinéraire, consulter les prochains passages en temps réel, suivre le trafic et garder ses favoris.

Projet de groupe du cours d'Angular (v1 présentée en démo le 02/12/2026), réalisé par **Zoléni Kokolo Zassi** et **Aliou Mamadou Diallo**.

> **État d'avancement** : le squelette Angular est en place (CLI 22, Vitest, SCSS) et l'accès aux API PRIM est validé (authentification, quotas, CORS). Les fonctionnalités ci-dessous sont **en cours de développement**, elles ne sont pas encore toutes implémentées.

## Fonctionnalités

Chaque fonctionnalité repose sur un appel d'API, comme l'exige le sujet.

| # | Fonctionnalité | API PRIM |
|---|---|---|
| 1 | **Recherche de lieux** : autocomplétion d'adresses, d'arrêts et de gares | Calculateur IDFM v2 (`/places`) |
| 2 | **Calcul d'itinéraire** : départ → arrivée, date et heure, étapes, durée, correspondances | Calculateur IDFM v2 (`/journeys`) |
| 3 | **Prochains passages** : horaires en temps réel sur un arrêt | Prochains passages, requête unitaire (SIRI Lite) |
| 4 | **Infos trafic** : perturbations par ligne ou par mode | Messages Info Trafic v2 (`/line_reports`) |
| 5 | **Favoris** : lieux, arrêts et trajets enregistrés, rafraîchis via l'API | Les trois API ci-dessus |

**Angle distinctif** : plutôt qu'un calculateur de plus, l'application vise à « se déplacer mieux » en enrichissant ces fonctionnalités avec des jeux de données PRIM (accessibilité et état des ascenseurs, empreinte CO₂ d'un trajet, positionnement dans la rame). Ces pistes sont détaillées dans [NOTES.md](NOTES.md).

## Stack technique

- [Angular](https://angular.dev) 22 (composants, routing, services, `HttpClient`, formulaires réactifs, signals)
- [RxJS](https://rxjs.dev) (`debounceTime`, `switchMap`, `shareReplay`, rafraîchissement périodique)
- SCSS pur, fait maison (variables et mixins dans `src/styles/`), sans Bootstrap ni Angular Material : aucun template prêt à l'emploi
- [Vitest](https://vitest.dev) + jsdom pour les tests unitaires
- Prettier pour le formatage

## Prérequis

- [Node.js](https://nodejs.org) (version LTS récente) et npm 11
- Un compte [PRIM](https://prim.iledefrance-mobilites.fr) et un **jeton d'authentification** (voir ci-dessous)

## Installation

```bash
git clone https://github.com/mdaliou7/projetinf1.git
cd projetinf1
npm install
```

### Clé API PRIM

1. Créer un compte sur [prim.iledefrance-mobilites.fr](https://prim.iledefrance-mobilites.fr).
2. Aller dans **Mes jetons d'authentification** → onglet API → **Générer mon jeton**. Il n'est visible en entier qu'**une seule fois** : le copier immédiatement.
3. Copier `.env.example` en `.env` et y renseigner le jeton :

   ```bash
   cp .env.example .env
   ```

   ```env
   PRIM_API_KEY = "votre-jeton"
   ```

Le jeton s'envoie dans l'en-tête HTTP `apiKey` de chaque requête, via un intercepteur HTTP. Un seul jeton sert pour toutes les API.

> ⚠️ **Ne jamais commiter `.env`** (il est ignoré par git). Comme l'application tourne dans le navigateur, la clé y reste visible : c'est acceptable pour un projet de cours, pas pour de la production.

## Lancer le projet

```bash
npm start
```

Ouvrir ensuite [http://localhost:4200](http://localhost:4200). L'application se recharge automatiquement à chaque modification des sources.

| Commande | Effet |
|---|---|
| `npm start` | Serveur de développement (`ng serve`) |
| `npm run build` | Build de production dans `dist/` |
| `npm run watch` | Build en continu, configuration de développement |
| `npm test` | Tests unitaires (Vitest) |

## Notes sur les API PRIM

- **Quotas** : 1 000 requêtes par jour et 5 par seconde, par API. Le code doit donc limiter les appels : autocomplétion avec `debounceTime` et minimum 3 caractères, cache des réponses, rafraîchissement des prochains passages toutes les 30 à 60 s.
- **CORS** : testé avec une vraie clé depuis `http://localhost:4200`, les trois API répondent 200 sans proxy.
- **Identifiants** : le Calculateur utilise des identifiants `IDFM:xxxxx`, les Prochains passages des identifiants `STIF:StopArea:SP:xxxxx:`. Ils sont différents. Pour les favoris, on stocke la zone d'arrêts (`stop_area`) plutôt que le point d'arrêt, dont l'identifiant change chaque jour pour les bus.
- **Temps réel** : disponible sur une partie seulement du réseau, voir le jeu de données « Périmètre des données temps réel disponibles ».

Le détail de ces vérifications se trouve dans [NOTES.md](NOTES.md) et [PRIM-API-infos.md](PRIM-API-infos.md).

## Structure du dépôt

```
.
├── src/                 Code de l'application Angular (détail ci-dessous)
├── public/              Fichiers statiques
├── scripts/             generate-env.mjs : génère environment.ts depuis .env
├── NOTES.md             Cadrage, quotas, CORS, planning, démo
├── PRIM-API-infos.md    Catalogue des API et jeux de données PRIM
├── Projet.pdf           Sujet du projet
└── angular.json         Configuration Angular CLI
```

## Architecture de l'application

```
src/
├── styles.scss · styles/        SCSS maison : _variables.scss, _mixins.scss
├── environments/                environment.ts (généré depuis .env, ignoré par git)
└── app/
    ├── app.ts · app.config.ts · app.routes.ts    coquille, configuration, routes
    ├── services/        TOUS les services (@Service), un fichier par domaine :
    │                    lieux-api, itineraire-api, horaires-api, trafic-api, prim-usage
    ├── interceptors/    prim-api-key (ajoute l'en-tête apiKey), prim-error (erreurs → PrimApiError)
    ├── models/          interfaces des réponses, un fichier par domaine (+ erreur commune)
    ├── config/          URLs PRIM, jeton, nom de l'appli, liens de navigation
    ├── layout/          header, footer, bottom-nav (barre d'onglets sur mobile)
    ├── pages/           un composant par route, chargé à la demande (lazy loading)
    │                    accueil, lieux, itineraire, horaires, trafic, favoris, page404, dev-api
    └── components/      composants réutilisables (à venir : champ de recherche de lieux…)
```

Règles de dépendances :

- `models/` et `config/` n'importent rien ;
- `services/` utilise `models/` et `config/`, jamais un composant ;
- `components/` peut injecter un service ;
- `pages/` assemble `components/`, `services/` et `models/`.

Flux des données : `page → service (HttpClient) → intercepteurs → API PRIM`. Une page n'appelle jamais `HttpClient` directement, et les erreurs HTTP arrivent sous la forme unique `PrimApiError`.

| URL | Page |
|---|---|
| `/accueil` | accueil (`/` y redirige) |
| `/lieux` · `/itineraire` | recherche de lieux · calcul d'itinéraire |
| `/horaires` · `/horaires/:stopAreaId` | prochains passages d'un arrêt |
| `/trafic` · `/trafic/:lineId` | infos trafic |
| `/favoris` | favoris |
| `/dev` | bac à sable pour tester les API (mode développement uniquement, à retirer avant le rendu) |
| autre URL | `page404` |

> Après une modification de `angular.json`, relancer `npm start` : le serveur de développement ne la relit pas.

## Organisation

- Dépôt et projet nommés `projet-nomduprojet-prénom1-prénom2`, comme demandé dans le sujet.
- Travail sur des branches avec merge requests, aucun commit direct sur `main`.
- **Rendu** : 01/12/2026 à 23h59. **Démo** : 02/12/2026, 15 minutes, sans code.

## Licence

Distribué sous licence [MIT](LICENSE).

Les données restent soumises aux licences de leurs producteurs (Île-de-France Mobilités, licence Mobilité / ODbL pour les prochains passages). Ce projet n'est pas affilié à Île-de-France Mobilités.
