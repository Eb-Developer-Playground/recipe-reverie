import { Route } from '@angular/router';
import { LoginGuard } from '@shared/guards/auth.guard';

export default [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('@auth/login/login.component').then((c) => c.LoginComponent),
    canActivate: [LoginGuard('/')],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('@auth/register/register.component').then(
        (c) => c.RegisterComponent
      ),
    canActivate: [LoginGuard('/')],
  },
] satisfies Route[];
