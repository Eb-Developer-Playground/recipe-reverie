import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';

// Checks if the user is logged in, and redirects to provided url if not
export function AuthGuard(redirectTo: string): CanActivateFn {
  return () => {
    return (
      inject(AuthService).isAuthenticated() ||
      inject(Router).createUrlTree([redirectTo])
    );
  };
}

// Does the opposite of above
// Checks if the user is NOT logged in, and redirects to provided url if they are
export function LoginGuard(redirectTo: string): CanActivateFn {
  return () => {
    const isAuthenticated = inject(AuthService).isAuthenticated();
    console.log('Is authenticated:', isAuthenticated);

    if (isAuthenticated) {
      console.log('Redirecting');
      return inject(Router).createUrlTree([redirectTo]);
    }

    console.log('Not redirecting');
    return true;
  };
}
