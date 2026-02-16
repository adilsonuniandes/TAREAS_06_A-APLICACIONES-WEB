import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SesionService } from './sesion.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const sesion = inject(SesionService).leer();
  if (!sesion?.token) return next(req);

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${sesion.token}` },
  });

  return next(authReq);
};
