# Cahier des Charges — Application de Transport en Commun

**Projet :** ZA Mobilités
**Auteurs :** Aliou, Zoleni  
**Formation :** Licence Informatique — Paris 1 Panthéon-Sorbonne  
**Date de rédaction :** 28 Octobre 2026  
**Version :** 1.1

---

## 1. Présentation du Projet

### 1.1 Contexte

Dans le cadre du cours d'Informatique (INF1) de la Licence à l'Université Paris 1, nous réalisons une petite application web sur le thème des transports en commun. Ce projet a pour **objectif principal d'apprendre à utiliser Angular**, un framework JavaScript développé par Google, ainsi que les bonnes pratiques de développement web en binôme (versioning Git, documentation, etc.).

Il ne s'agit pas de concevoir une application complète et définitive, mais d'une **application d'apprentissage** permettant de mettre en pratique les concepts vus en cours.

### 1.2 Objectif pédagogique

- Découvrir et pratiquer le framework **Angular** (composants, services, routeur, formulaires)
- Apprendre à consommer des **API externes** (données de transport, géocodage)
- Travailler en binôme avec **Git / GitHub** (branches, commits, pull requests)
- Produire une documentation de projet (cahier des charges, liste de fonctionnalités)

### 1.3 Objectifs SMART

| Critère | Objectif |
|---------|----------|
| **S**pécifique | Développer une application web Angular permettant de rechercher des itinéraires et de consulter les horaires des transports en commun |
| **M**esurable | Implémenter au moins 4 des 6 fonctionnalités listées dans `fonctionnalites.md` avec une interface utilisable |
| **A**tteignable | Réalisé par un binôme d'étudiants M1 en utilisant Angular, des API publiques et les ressources fournies par le cours |
| **R**éaliste | Application de taille réduite, centrée sur l'apprentissage d'Angular — pas une application commerciale complète |
| **T**emporel | Projet finalisé et présenté en démonstration avant la fin du semestre (session d'examens 2026-2027) |

### 1.4 Public cible

L'application est avant tout un **support d'apprentissage**. Fonctionnellement, elle s'adresse aux usagers des transports en commun souhaitant planifier un trajet ou consulter des horaires.

---

## 2. Fonctionnalités

Les fonctionnalités sont définies dans [`docs/fonctionnalites.md`](fonctionnalites.md). Voici leur détail.

### 2.1 Recherche de lieu et arrêt

L'utilisateur peut rechercher un lieu ou un arrêt de transport via une barre de recherche.  
**Idée d'amélioration :** ajouter une **autocomplétion** pour suggérer des résultats en cours de saisie.

### 2.2 Calcul d'itinéraire

L'utilisateur saisit un départ et une arrivée ; l'application affiche un itinéraire avec les lignes de transport à emprunter.

### 2.3 Info trafic

L'application affiche les **perturbations en cours** sur les lignes de transport (retards, travaux, etc.).

### 2.4 Prochains passages

L'utilisateur peut consulter les **prochains passages** à un arrêt donné, filtrables par type de transport.

### 2.5 Sauvegarde de trajets

L'utilisateur connecté peut **sauvegarder et retrouver** ses itinéraires favoris.

### 2.6 Compte personnel

L'utilisateur peut créer un compte, se connecter et gérer son profil (trajets sauvegardés, préférences).

---

## 3. Spécifications Techniques

### 3.1 Technologies utilisées

| Composant         | Technologie                          |
|-------------------|--------------------------------------|
| Framework front   | Angular 22                           |
| Langage           | TypeScript 6                         |
| UI / Styles       | Bootstrap ou Angular Material (CSS)  |
| Tests unitaires   | Vitest                               |
| Gestionnaire pkg  | npm                                  |
| Versioning        | GitHub                               |
| Formatage code    | Prettier                             |

> Le PDF du projet mentionne **Bootstrap** (`getbootstrap.com`) et **Angular Material** (`material.angular.io`) comme ressources de style à disposition.

### 3.2 Appel d'API et CORS

L'application communique avec des API externes pour récupérer les données de transport en temps réel. La gestion du **CORS** (Cross-Origin Resource Sharing) est un point technique à traiter :

- Pendant le développement, un proxy comme [`cors-anywhere`](https://cors-anywhere.herokuapp.com/corsdemo) peut être utilisé.
- En production, un backend proxy ou une API nativement compatible CORS sera préféré.

### 3.3 API externes envisagées

- **API Île-de-France Mobilités / RATP** : données temps réel (passages, perturbations)
- **OpenStreetMap / Nominatim** : géocodage pour la recherche de lieux

### 3.4 Architecture Angular

L'application est structurée selon les conventions Angular :

- **Composants** : gèrent l'affichage et les interactions (pages, formulaires, listes)
- **Services** : encapsulent les appels API et la logique métier
- **Modèles (interfaces)** : définissent les types de données (Arrêt, Itinéraire, Utilisateur…)
- **Routeur Angular** : gère la navigation entre les vues

---

## 4. Organisation et Notation

Conformément au PDF du projet :

- Le projet est réalisé **en binôme**
- Le code doit être **hébergé sur GitHub** et régulièrement mis à jour
- Une **démonstration** du projet sera réalisée en fin de projet
- Une **documentation** minimale est attendue (ce fichier + `fonctionnalites.md` + `README.md`)

---

## 5. Livrables

| Livrable                     | Description                                         |
|------------------------------|-----------------------------------------------------|
| Code source (GitHub)         | Dépôt versionné, propre et fonctionnel              |
| `README.md`                  | Instructions pour installer et lancer le projet     |
| `docs/cahier_de_charges.md`  | Ce document                                         |
| `docs/fonctionnalites.md`    | Liste synthétique des fonctionnalités               |
| Démonstration live           | Présentation du projet en fonctionnement            |

---

## 6. Planning Prévisionnel

> La planification est indicative et sera ajustée en fonction de l'avancement réel du projet.

| Étape | Fonctionnalité(s) ciblée(s) | Période estimée |
|-------|----------------------------|-----------------|
| Mise en place du projet | Initialisation Angular, GitHub, structure des composants | Semaine 1 |
| Recherche & Itinéraire | Recherche de lieu/arrêt + autocomplétion + calcul d'itinéraire | Semaines 2 – 3 |
| Données temps réel | Info trafic + prochains passages | Semaine 4 |
| Compte utilisateur | Compte perso + sauvegarde de trajets | Semaines 5 – 6 |
| Finalisation | Tests, corrections, documentation | Semaine 7 |
| Rendu & Démonstration | Présentation live du projet | Fin de semestre |

---

## 7. Glossaire

| Terme          | Définition                                                                 |
|----------------|----------------------------------------------------------------------------|
| Angular        | Framework JavaScript open-source (Google) pour créer des SPA              |
| Composant      | Brique de base d'une app Angular (HTML + TypeScript + CSS)                 |
| Service        | Classe Angular qui gère la logique et les appels API                       |
| CORS           | Mécanisme de sécurité du navigateur limitant les appels entre origines     |
| API            | Interface permettant à l'app de récupérer des données externes             |
| SPA            | Single Page Application — une app web avec une seule page rechargée       |
| Arrêt          | Point physique où s'arrête un transport en commun                          |
| Itinéraire     | Trajet calculé de A vers B avec les lignes à emprunter                     |

---

*Document rédigé dans le cadre du cours INF1 — Université Paris 1 Panthéon-Sorbonne.*
