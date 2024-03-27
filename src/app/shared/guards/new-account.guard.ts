import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '@shared/services/user.service';

// A guard that will redirect accounts that don't have the bare minimum setup details to the setup profile page
export function NewAccountGuard(): CanActivateFn {
  return () => {
    const user = inject(UserService).userDetails();

    if (user?.phoneNumber && user.countryCode && user.country) return true;
    else return inject(Router).createUrlTree(['accounts/setup-profile']);
  };
}
