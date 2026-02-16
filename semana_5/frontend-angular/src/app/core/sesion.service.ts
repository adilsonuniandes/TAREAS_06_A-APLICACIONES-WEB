import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Sesion, Rol } from './sesion.model';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private key = environment.claveSesion;

  guardar(s: Sesion) {
    localStorage.setItem(this.key, JSON.stringify(s));
  }

  leer(): Sesion | null {
    const raw = localStorage.getItem(this.key);
    if (!raw) return null;
    try { return JSON.parse(raw) as Sesion; } catch { return null; }
  }

  limpiar() {
    localStorage.removeItem(this.key);
  }

  tieneToken(): boolean {
    return !!this.leer()?.token;
  }

  roles(): Rol[] {
    return this.leer()?.roles ?? [];
  }

  tieneRol(rol: Rol): boolean {
    return this.roles().includes(rol);
  }

  puedeEscribir(): boolean {
    return this.tieneRol('administrador') || this.tieneRol('supervisor');
  }

  puedeEliminar(): boolean {
    return this.tieneRol('administrador');
  }
}
