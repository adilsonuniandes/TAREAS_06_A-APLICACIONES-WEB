import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SesionService } from './sesion.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const ses = inject(SesionService);
  const s = ses.leer();

  if (!s?.token) return next(req);

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${s.token}` }
  });

  return next(authReq);
};
