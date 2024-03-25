import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('@home/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'accounts',
    loadChildren: () => import('@accounts/accounts.routes'),
  },
  {
    path: 'auth',
    loadChildren: () => import('@auth/auth.routes'),
  },
];
