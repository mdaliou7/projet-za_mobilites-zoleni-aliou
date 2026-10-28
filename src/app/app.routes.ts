import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'api-test' },
  {
    path: 'api-test',
    loadComponent: () => import('./pages/api-test/api-test').then((m) => m.ApiTest)
  }
];
