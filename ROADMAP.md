# Feuille de route — ZA Mobilités

> Écrite le 2026-10-30. **À mettre à jour à chaque merge** : cocher ce qui est fait, ajouter ce qu'on découvre.
> Qui : **Z** = Zoléni (`sikoso774`) · **A** = Aliou (`mdaliou7`). Les attributions marquées *(proposé)* sont à confirmer entre vous.

## Les dates qui comptent

| Date | Jalon |
|---|---|
| **Sam. 22/11** | Gel des fonctionnalités : on ne démarre plus rien de nouveau |
| **Sam. 28/11** | Version finale prête, relecture croisée faite |
| **Lun. 30/11** | PR finale vers `main` mergée : **`main` doit contenir le livrable** |
| **Mar. 01/12, 23h59** | **Rendu** (code sur GitHub) |
| **Mer. 02/12** | **Démo** : 15 min maximum, fonctionnelle, **sans montrer de code**, interruptible par la classe |

Notation : projet coef 2, démo coef 1. Le sujet préfère **peu de fonctionnalités bien finies** à beaucoup de bâclées.

## Où on en est (30/10)

**Fait**
- [x] Projet Angular 22, dépôt, README, licence, cahier des charges (`docs/`, sur `main`)
- [x] Accès PRIM validé : clé, quotas (1 000 requêtes/jour/API), CORS sans proxy
- [x] Architecture : `services/`, `interceptors/`, `models/`, `config/`, `layout/`, `pages/` (lazy loading), `page404`, SCSS maison
- [x] Intercepteurs : clé `apiKey` + erreurs en `PrimApiError`
- [x] **Recherche de lieux** avec autocomplétion (`components/lieux-recherche`, cache dans `LieuxApi`) — #17
- [x] Bac à sable `/dev` : lieux, itinéraire, trafic, prochains passages répondent
- [x] Docs : `NOTES.md`, `PRIM-API-infos.md`, note Obsidian

**Reste à faire** : itinéraire, prochains passages, infos trafic (écran), favoris, finitions, démo.

## Les 5 fonctionnalités (le sujet en exige 5 minimum)

Chacune doit **faire un appel API** et être **validée par le prof**.

| # | Fonctionnalité | API | Qui | État |
|---|---|---|---|---|
| 1 | Recherche de lieux | Calculateur `/places` | Z | ✅ fait |
| 2 | Calcul d'itinéraire | Calculateur `/journeys` | Z *(proposé)* | à faire |
| 3 | Prochains passages | Prochains passages `/stop-monitoring` | Z *(proposé)* | à faire |
| 4 | Infos trafic | Messages Info Trafic `/line_reports` | **A** (#16) | en cours |
| 5 | Favoris | les trois précédentes, via rafraîchissement | Z + A *(proposé)* | à faire |

> ⚠️ Le cahier des charges parle de « 4 des 6 fonctionnalités », le sujet de **5 minimum** : viser les 5 ci-dessus. Le compte personnel n'en fait pas partie (voir « Décisions »).

## Backlog détaillé

### 2. Itinéraire — *Z (proposé)*
- [ ] Page `/itineraire` : formulaire réactif avec **deux** `lieux-recherche` (départ, arrivée) + date et heure, bouton « Partir maintenant »
- [ ] Validation : départ et arrivée choisis, et différents
- [ ] Helper de date au format Navitia `AAAAMMJJTHHMMSS` + tests (**vérifier le fuseau**, voir « Décisions »)
- [ ] Résultats : liste des trajets (heures, durée, correspondances) puis détail des étapes (marche, ligne, direction)
- [ ] Composant `components/line-badge` : pastille de ligne colorée (réutilisée par horaires et trafic)
- [ ] États chargement / erreur / aucun trajet ; URL partageable (`?from=…&to=…&datetime=…`)
- [ ] Tests (service, composants)

### 3. Prochains passages — *Z (proposé)*
- [ ] **Vérifier la vraie réponse SIRI** d'un arrêt (le bac à sable n'a montré que le statut 200) et ajuster `horaires.models.ts`
- [ ] Vérifier la correspondance d'identifiants : `stop_area:IDFM:71264` (Calculateur) → `STIF:StopArea:SP:71264:` (Prochains passages)
- [ ] Page `/horaires` : choisir un arrêt avec `lieux-recherche` (types « Arrêt » seulement)
- [ ] Liste : pastille de ligne, destination, « dans X min », statut ; filtre par mode
- [ ] Rafraîchissement toutes les 30 à 60 s (`timer` + `switchMap`), arrêté quand on quitte la page
- [ ] Arrêt sans temps réel : message clair (voir jeu de données « Périmètre des données temps réel »)
- [ ] Route `/horaires/:stopAreaId` fonctionnelle de bout en bout

### 4. Infos trafic — *A (#16)*
- [ ] Page `/trafic` : lignes par mode (métro, RER, tramway, train…) avec pastille d'état comme l'appli IDFM (bloquante, perturbée, info, travaux)
- [ ] Détail d'une ligne `/trafic/:lineId` : messages (HTML via `[innerHTML]`, Angular le nettoie)
- [ ] Confirmer les identifiants de mode RER et tramway (`physical_mode:…`) à partir de la réponse
- [ ] Pannes d'ascenseur par station (`isElevatorOutage` existe déjà dans `trafic.models.ts`)
- [ ] Partir de la branche `zoleni` (la structure a changé) ; ne pas passer par l'ancien `PrimApiService`

### 5. Favoris — *Z + A (proposé)*
- [ ] `services/favoris-store.ts` : signals + `localStorage` (`effect`), lieux et arrêts d'abord, trajets ensuite
- [ ] Bouton ⭐ sur les résultats de lieux, d'arrêts et d'itinéraires
- [ ] Page `/favoris` : liste, suppression, et **rafraîchissement via l'API** (prochains passages, trafic) en respectant le quota
- [ ] Stocker le `stop_area`, **pas** le `stop_point` (les identifiants de bus changent chaque jour)

### Notre angle distinctif *(choisir une seule piste)*
IDFM et Citymapper font déjà itinéraires et horaires. On se démarque par « se déplacer mieux » :
- [ ] **A — Trajet accessible** : sur un itinéraire, signaler les pannes d'ascenseur des stations traversées (croise trafic + itinéraire). *Recommandé : les données existent déjà dans l'API trafic.*
- [ ] **B — Empreinte CO₂** d'un trajet, d'après les facteurs d'émission par mode du jeu de données PRIM

### Finitions (semaine du 23/11)
- [ ] Design cohérent sur toutes les pages, responsive vérifié sur mobile
- [ ] États vides, chargement et erreur partout ; accessibilité clavier
- [ ] **Retirer `/dev`** (route et dossier `pages/dev-api`) et `src/app/json/` s'il traîne
- [ ] README (fonctionnalités, captures) et cahier des charges mis à jour
- [ ] `npm test` et `npm run build` verts ; relecture croisée du code

## Décisions à prendre

| # | Question | Ce qu'on sait | Proposition |
|---|---|---|---|
| 1 | Les 5 fonctionnalités sont-elles **validées par le prof** ? Et le listing de tâches ? | Exigé par le sujet | Lui envoyer la liste ci-dessus et le tableau GitHub Projects cette semaine |
| 2 | **Compte personnel** : dedans ou dehors ? | Sans backend, un « compte » ne ferait aucun appel API, donc ne compterait pas comme fonctionnalité | Dehors : favoris locaux (`localStorage`). À reprendre seulement s'il reste du temps |
| 3 | **Fuseau horaire** de `datetime` dans `/journeys` | Le trafic renvoie l'heure de Paris, mais une autre réponse annonçait `Africa/Abidjan` (UTC) | Tester : même départ avec `datetime` explicite, comparer les heures renvoyées |
| 4 | Angle distinctif : A (ascenseurs) ou B (CO₂) ? | A réutilise des données déjà reçues | A |
| 5 | Mettre à jour `docs/` sur `main` | Il mentionne Bootstrap/Material, « 4 des 6 fonctionnalités », Nominatim et cors-anywhere, devenus faux | Corriger lors de la PR finale |
| 6 | Qui branche sur quoi ? | `main` a 6 commits que `zoleni` n'a pas (dossier `docs/`) ; la fusion est propre | Voir « Méthode de travail » |

## Méthode de travail

- **Branches** : on développe sur `zoleni`. Jamais de commit direct sur `main`. Aliou part de `zoleni` pour le trafic.
- **Avant chaque push** : `npm test -- --no-watch` et `npm run build` passent.
- **Commits** : en français, à l'impératif, une idée par commit.
- **Ne jamais commiter** `.env` ni `src/environments/environment.ts` (ils contiennent la clé API).
- **Où ranger quoi** : voir « Architecture » dans le [README](README.md) (services dans `services/`, une page par route dans `pages/`, composants réutilisables dans `components/`).
- **Relancer `npm start`** après toute modification de `angular.json`.
- **PR vers `main`** : on n'en ouvre pas avant d'avoir de quoi présenter, mais **au plus tard le 30/11**. La fusion avec `main` ne pose pas de conflit.

## Pièges connus

| Sujet | À retenir |
|---|---|
| Quota | 1 000 requêtes par jour et par API : délai de frappe, cache, pas de requête en boucle. **Garder du quota pour le jour de la démo** |
| Identifiants | Le Calculateur (`stop_area:IDFM:…`) et Prochains passages (`STIF:StopArea:SP:…:`) n'utilisent pas les mêmes |
| Temps réel | Disponible sur une partie du réseau seulement : choisir à l'avance des arrêts qui marchent |
| Info trafic | Sans filtre, l'API renvoie surtout des bus : filtrer par mode (`physicalMode`). Le tableau `disruptions` concerne la page entière, pas chaque ligne |
| Adresses | L'identifiant d'une adresse est directement `longitude;latitude`, utilisable tel quel dans `/journeys` |

## Démo du 02/12 (15 minutes, sans code)

**Fil rouge** : « Je cherche un trajet, je vérifie qu'il est accessible, je regarde les prochains passages, je suis le trafic, je mets en favori. »

- [ ] Scénario écrit minute par minute, répété **au moins 2 fois** en conditions réelles
- [ ] Lieux, arrêts et lignes qui marchent à coup sûr, **testés la veille**
- [ ] Vue mobile montrée (barre d'onglets du bas)
- [ ] Répartition de la parole entre nous deux ; marge pour les questions de la classe
- [ ] **Plan B** si le réseau ou l'API tombe (captures ou données de secours) ; surveiller la page « État des API » de PRIM
- [ ] Ne pas épuiser le quota la veille

## Liens utiles

[README](README.md) · [docs/NOTES.md](docs/NOTES.md) · [docs/PRIM-API-infos.md](docs/PRIM-API-infos.md) · [docs/Projet.pdf](docs/Projet.pdf) · cahier des charges : `docs/cahier_de_charges.md` (sur `main`)
