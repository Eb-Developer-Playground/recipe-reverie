import { Route } from '@angular/router';

export default [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('@auth/login/login.component').then((c) => c.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('@auth/register/register.component').then(
        (c) => c.RegisterComponent
      ),
  },
] satisfies Route[];
