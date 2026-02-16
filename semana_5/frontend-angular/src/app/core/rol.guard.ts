import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SesionService } from './sesion.service';
import { Rol } from './sesion.model';

export const rolGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const rolesPermitidos = (route.data['roles'] ?? []) as Rol[];
  const sesion = inject(SesionService);
  const router = inject(Router);

  const ok = rolesPermitidos.some(r => sesion.tieneRol(r));
  if (ok) return true;

  router.navigateByUrl('/app/departamentos');
  return false;
};
