import { Route } from '@angular/router';
import { AuthGuard } from '@shared/guards/auth.guard';
import { NewAccountGuard } from '@shared/guards/new-account.guard';

export default [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  {
    path: 'setup-profile',
    loadComponent: () =>
      import('@accounts/new-profile/new-profile.component').then(
        (c) => c.NewProfileComponent
      ),
    canActivate: [AuthGuard('auth/login')],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('@accounts/profile/profile.component').then(
        (c) => c.ProfileComponent
      ),
    canActivate: [AuthGuard('auth/login'), NewAccountGuard()],
  },
] satisfies Route[];
