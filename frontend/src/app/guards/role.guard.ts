import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data?.['roles'] as string[] || [];

  const currentUser = authService.currentUser();
  if (authService.isAuthenticated() && currentUser && expectedRoles.includes(currentUser.role)) {
    return true;
  }

  // Redirect to their default homepage
  router.navigate(['/']);
  return false;
};
