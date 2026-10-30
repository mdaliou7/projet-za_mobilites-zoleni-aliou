# PRIM — Ce qu'on a appris du lien « Explorer les API »

> Note du 2026-10-26.
> Lien : https://prim.iledefrance-mobilites.fr/fr/aide-et-contact/documentation/donnees-disponibles/api/explorer-les-api
> Complété par le catalogue : https://prim.iledefrance-mobilites.fr/fr/catalogue-data?type=api

## Honnêteté sur les sources

La page du lien est une **simple page d'introduction** : peu de contenu technique. Un fetch simple
renvoie 403 (il faut un vrai navigateur). Le détail vient du **catalogue** PRIM, que le lien
renvoie à explorer. Ce qui suit est classé par niveau de fiabilité :

- ✅ **Lu sur PRIM** : page d'intro et catalogue
- ⚠️ **Recoupé hors PRIM** (recherche web, non confirmé sur la doc officielle)
- ❓ **À vérifier** : rien n'a été testé, aucun appel n'a été fait

## ✅ Ce que dit la page « Explorer les API » (mise à jour le 22/07/2025)

- Le service API partage les **données de transport dynamiques** avec le grand public :
  horaires et prochains passages, recherche d'itinéraires et de lieux, perturbations,
  isochrones, exploration du réseau.
- Données **théoriques et temps réel**.
- Chiffres annoncés : **14 API publiées**, dont 12 produites par IDFM, **plus de 230 millions de
  requêtes par mois**. (Le catalogue en affiche aujourd'hui **15**, l'écart vient sans doute de la
  date de mise à jour de la page.)
- La page mène vers deux autres pages de doc utiles :
  - « Générer un jeton pour accéder aux jeux de données restreints »
  - « Bonnes pratiques d'utilisation des API » (à lire avant de coder : quotas, cache…)

## ✅ Les 15 API du catalogue

Toutes sont marquées **« connexion requise »** (compte PRIM + clé).

| API | Rôle | Utile pour nous ? |
|---|---|---|
| **Calculateur IDFM – Accès générique (v2)** (Navitia) | Services de consultation des réseaux franciliens : lieux, itinéraires, horaires… | **Oui, cœur du projet** |
| **Calculateur IDFM – Messages Info Trafic (v2)** | Infos trafic temps réel, par ligne ou mode | **Oui** (trafic) |
| **Messages Info Trafic – Requête globale** | Toutes les perturbations en cours et à venir + lignes et arrêts concernés | Oui (alternative) |
| **Prochains passages – requête unitaire** | Prochains passages estimés à un arrêt | **Oui** |
| **Prochains passages – requête ligne** | Idem, pour les arrêts d'une ligne | Oui |
| **Prochains passages – requête globale** | Tous les arrêts du réseau en un seul échange (gros volume) | Non (trop lourd) |
| **Calculateur IDFM – Isochrones (v2)** | Zone accessible en transport en commun pour une durée donnée | Bonus / différenciation |
| Calculateur d'itinéraires vélo – **Geovelo** | Trajet vélo adapté et sécurisé | Bonus (tiers) |
| Disponibilités temps réel – **Vélib'** | Vélos mécaniques/électriques et bornes libres par station | Bonus (tiers) |
| Diffusion du Référentiel Arrêts – **ICAR** | Objets de référence du référentiel des arrêts | Peut-être |
| Diffusion du référentiel des lignes – **ILICO** | Objets liés à une ou plusieurs lignes commerciales | Peut-être |
| Génération des indices de lignes – ILICO | Indices normalisés de chaque ligne | Non |
| Offre de transport théorique – **IBOO** | Toute l'offre théorique d'IDFM | Non (trop lourd) |
| Messages affichés sur les écrans | Messages d'info des écrans dans les espaces de transport | Non |
| Génération de **QR Codes** aux arrêts | QR code vers la page d'un arrêt sur le portail IDFM | Gadget possible |

À noter aussi un **widget « Marque-Grise Recherche d'itinéraires »** (calculateur prêt à intégrer).
**À éviter** : le sujet interdit les templates tout faits, et un widget clé en main y ressemble.

## ✅ Jeux de données du catalogue qui peuvent nous démarquer

Le catalogue compte aussi **94 jeux de données**. C'est ici qu'on peut sortir de l'ombre de
Citymapper et de l'appli IDFM, qui font déjà itinéraires et horaires.

| Piste de différenciation | Jeux de données |
|---|---|
| **Accessibilité (PMR, poussettes…)** | « État des ascenseurs » (mis à jour quotidiennement, connexion requise) ; « Accessibilité en gare » |
| **Empreinte carbone** | « Émission de CO2e par voyageur-km » : IDFM l'utilise lui-même pour le calcul CO2 de son calculateur |
| **Confort / bien-être** | « Qualité de l'air dans le réseau francilien » (Airparif), « Fontaines à proximité des arrêts », « Positionnement dans la rame » (où se placer pour sa sortie), « Toilettes publiques RATP » |
| **Intermodal** | « Parking relais », « Parking vélos IDFM », « Stationnement vélo », « Aménagements vélo » |
| **Contexte réseau** | « Grands travaux d'été 2026 », « Cartes des travaux » |

Idée de positionnement possible : une appli de trajet **centrée sur le confort et l'accessibilité**
(trajet accessible + où se placer dans la rame + qualité de l'air + empreinte CO2), plutôt qu'un
énième calculateur. Plusieurs de ces jeux sont des fichiers à télécharger (CSV/JSON) et pas
forcément des API : il faut vérifier si une API de consultation existe, sinon les embarquer
comme JSON statiques. Le sujet exige qu'**une fonctionnalité appelle une API** : les garder
comme **enrichissement** des 5 fonctionnalités principales, pas comme fonctionnalité isolée.

## ✅ Jeux de données de référence utiles

- **Référentiel des arrêts** (arrêts, zones d'arrêts, zones de correspondance, pôles d'échange)
- **Horaires prévus – GTFS Datahub** (30 prochains jours, mis à jour 3 fois par jour : 8h, 13h, 17h ; connexion requise)
- **Périmètre des données temps réel** : liste des arrêts et lignes couverts en temps réel. **À consulter avant la démo** pour choisir des arrêts qui marchent
- **Gares et stations**, **Tracés des lignes** (source GTFS), **Référentiel des lignes**

## ⚠️ Recoupé hors PRIM (non confirmé)

- L'API Calculateur est basée sur **Navitia**. La doc de référence des paramètres serait sur
  **doc.navitia.io** (endpoints `places`, `journeys`, `departures`, `line_reports`…).
- Pour obtenir la clé : créer un compte PRIM, ouvrir l'espace développeur, **souscrire à l'API**
  voulue, puis récupérer la clé dans le tableau de bord. Elle s'envoie dans un **header `apiKey`**.
- Un projet tiers affirme que l'API de calcul d'itinéraire n'est plus exposée sur PRIM et que
  seul le temps réel (SIRI) l'est. Cela **contredit** le catalogue actuel, qui liste bien le
  Calculateur v2. Probablement une info périmée, mais **raison de plus de tester tôt**.
- Documents « Documentation fonctionnelle PRIM » (PDF, 2021 à 2022) existent sur le site PRIM,
  mais non lisibles ici (403). À ouvrir dans le navigateur.

## ❓ À vérifier / à faire

- [ ] Créer le compte PRIM, souscrire aux API de la liste « Oui », récupérer la clé
- [ ] Lire « Bonnes pratiques d'utilisation des API » (quotas, fréquence d'appel, cache)
- [ ] Lire « Générer un jeton pour accéder aux jeux de données restreints » (utile pour l'état des ascenseurs et le GTFS)
- [ ] Tester `places` et `journeys` depuis le navigateur : **CORS** OK ou pas ?
- [ ] Noter l'URL de base exacte, le format des réponses et les **quotas** de chaque API
- [ ] Vérifier si les jeux de données de différenciation (ascenseurs, CO2, qualité de l'air…) ont une API de consultation ou seulement un export
- [ ] Décider de l'angle de différenciation et le présenter au prof avec la liste des fonctionnalités
