import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/trips',
    pathMatch: 'full'
  },
  {
    path: 'trips',
    loadComponent: () => import('./pages/trips/trips').then(m => m.Trips)
  }
];
