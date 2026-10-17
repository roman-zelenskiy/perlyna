import { Routes } from '@angular/router';
import { langMatch } from './core/i18n';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/lang-root') },
  {
    path: ':lang',
    canMatch: [langMatch],
    children: [
      { path: '', loadComponent: () => import('./pages/home') },
      { path: 'polityka-konfidentsiinosti', loadComponent: () => import('./pages/privacy') },
      { path: '**', loadComponent: () => import('./pages/not-found') },
    ],
  },
  { path: '**', loadComponent: () => import('./pages/not-found') },
];
