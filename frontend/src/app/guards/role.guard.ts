import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = (route.data?.['roles'] as string[] || []).map(r => r.toUpperCase());

  const currentUser = authService.currentUser();
  const userRole = currentUser?.role?.toUpperCase();

  if (authService.isAuthenticated() && userRole && expectedRoles.includes(userRole)) {
    return true;
  }

  if (authService.isAuthenticated()) {
    if (userRole === 'ADMIN') {
      router.navigate(['/dashboard']);
    } else {
      router.navigate(['/profile']);
    }
  } else {
    router.navigate(['/auth/login']);
  }
  return false;
};
