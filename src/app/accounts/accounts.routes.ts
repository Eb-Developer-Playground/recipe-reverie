import { Route } from '@angular/router';

export default [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  {
    path: 'setup-profile',
    loadComponent: () =>
      import('@accounts/new-profile/new-profile.component').then(
        (c) => c.NewProfileComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('@accounts/profile/profile.component').then(
        (c) => c.ProfileComponent
      ),
  },
] satisfies Route[];
