import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SesionService } from './sesion.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private ses: SesionService, private router: Router) {}

  canActivate(): boolean {
    if (this.ses.esAdmin()) return true;
    this.router.navigate(['/departamentos']);
    return false;
  }
}
