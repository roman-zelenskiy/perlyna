import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home') },
  { path: 'polityka-konfidentsiinosti', loadComponent: () => import('./pages/privacy') },
  { path: '**', loadComponent: () => import('./pages/not-found') },
];
