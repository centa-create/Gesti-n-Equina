import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Usage: add data: { roles: ['admin', 'empleado'] } to route definition
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowed: string[] | undefined = route.data?.['roles'];

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (!allowed || allowed.length === 0) {
    return true; // no role restriction
  }

  const role = auth.getRole();
  if (role && allowed.includes(role)) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};