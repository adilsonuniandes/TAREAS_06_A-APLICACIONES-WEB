import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SesionService } from './sesion.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private ses: SesionService, private router: Router) {}

  canActivate(): boolean {
    if (this.ses.autenticado()) return true;
    this.router.navigate(['/inicio']);
    return false;
  }
}
