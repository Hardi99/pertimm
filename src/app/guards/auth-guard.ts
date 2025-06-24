import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // On lit directement la valeur du signal 'isAuthenticated'. C'est simple et efficace.
  if (authService.isAuthenticated()) {
    return true; // Accès autorisé
  }
  
  // Non connecté, redirection vers login
  return router.createUrlTree(['/login']);
};