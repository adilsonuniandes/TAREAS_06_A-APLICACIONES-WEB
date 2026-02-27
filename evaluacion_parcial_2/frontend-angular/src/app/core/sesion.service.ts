import { Injectable } from '@angular/core';
import { Sesion } from './sesion.model';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly CLAVE = 'ep1_sesion';

  leer(): Sesion | null {
    const raw = localStorage.getItem(this.CLAVE);
    if (!raw) return null;
    try { return JSON.parse(raw) as Sesion; } catch { return null; }
  }

  guardar(s: Sesion): void {
    localStorage.setItem(this.CLAVE, JSON.stringify(s));
  }

  limpiar(): void {
    localStorage.removeItem(this.CLAVE);
  }

  autenticado(): boolean {
    const s = this.leer();
    return !!s?.token;
  }

  username(): string {
    return this.leer()?.username ?? '—';
  }

  roles(): string[] {
    return this.leer()?.roles ?? [];
  }

  tieneRol(rol: string): boolean {
    return this.roles().includes(rol);
  }

  puedeEscribir(): boolean {
    return this.tieneRol('administrador') || this.tieneRol('supervisor');
  }

  puedeEliminar(): boolean {
    return this.tieneRol('administrador');
  }

  esAdmin(): boolean {
    return this.tieneRol('administrador');
  }
}
