import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },
  {
    path: 'accueil',
    title: 'Accueil',
    loadComponent: () => import('./pages/accueil/accueil').then((m) => m.Accueil)
  },
  {
    path: 'lieux',
    title: 'Lieux',
    loadComponent: () => import('./pages/lieux/lieux').then((m) => m.Lieux)
  },
  {
    path: 'itineraire',
    title: 'Itinéraire',
    loadComponent: () => import('./pages/itineraire/itineraire').then((m) => m.Itineraire)
  },
  {
    path: 'horaires',
    title: 'Horaires',
    loadComponent: () => import('./pages/horaires/horaires').then((m) => m.Horaires)
  },
  {
    path: 'horaires/:stopAreaId',
    title: 'Horaires',
    loadComponent: () => import('./pages/horaires/horaires').then((m) => m.Horaires)
  },
  {
    path: 'trafic',
    title: 'Trafic',
    loadComponent: () => import('./pages/trafic/trafic').then((m) => m.Trafic)
  },
  {
    path: 'trafic/:lineId',
    title: 'Trafic',
    loadComponent: () => import('./pages/trafic/trafic').then((m) => m.Trafic)
  },
  {
    path: 'favoris',
    title: 'Favoris',
    loadComponent: () => import('./pages/favoris/favoris').then((m) => m.Favoris)
  },
  // Bac à sable pour tester les API : absent des routes en production, à retirer avant le rendu.
  ...(isDevMode()
    ? [
        {
          path: 'dev',
          title: 'Bac à sable API',
          loadComponent: () => import('./pages/dev-api/dev-api').then((m) => m.DevApi)
        }
      ]
    : []),
  {
    path: '**',
    title: 'Page introuvable',
    loadComponent: () => import('./pages/page404/page404').then((m) => m.Page404)
  }
];
