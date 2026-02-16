import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SesionService } from './sesion.service';

export const authGuard: CanActivateFn = () => {
  const sesion = inject(SesionService);
  const router = inject(Router);
  if (sesion.tieneToken()) return true;
  router.navigateByUrl('/inicio');
  return false;
};
