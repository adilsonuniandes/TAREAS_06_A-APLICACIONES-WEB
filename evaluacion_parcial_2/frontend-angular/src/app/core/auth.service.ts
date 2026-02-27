import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { SesionService } from './sesion.service';

type RespLogin = { token: string; username: string; roles: string[] };

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService, private sesion: SesionService) {}

  async iniciarSesion(username: string, contrasena: string): Promise<void> {
    const data = await firstValueFrom(
      this.api.post<RespLogin>('/api/autenticacion/iniciar-sesion', { username, contrasena })
    );
    this.sesion.guardar({ token: data.token, username: data.username, roles: data.roles || [] });
  }

  cerrarSesion(): void {
    this.sesion.limpiar();
  }
}
