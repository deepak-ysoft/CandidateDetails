import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('jwtToken');
  const router = inject(Router);

  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);
      const isExpired = decodedToken.exp * 1000 < Date.now(); // Check expiration
      if (!isExpired) {
        return true;
      }
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }
  router.navigateByUrl('login');
  return false;
};

