import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const isLoggedIn = !!localStorage.getItem('authToken'); // Check if JWT token exists
  const userRole: string = authService.getRole() || ''; // Ensure userRole is always a string

  const expectedRoles: string[] = route.data?.['roles'] || []; // Get allowed roles from route data

  debugger;
  if (!isLoggedIn) {
    router.navigate(['/login']);
    return false;
  }

  if (expectedRoles.length > 0 && expectedRoles.includes(userRole)) {
    return true; // Allow access if role is valid
  }

  router.navigate(['/unauthorized']); // Redirect unauthorized users
  return false;
};
