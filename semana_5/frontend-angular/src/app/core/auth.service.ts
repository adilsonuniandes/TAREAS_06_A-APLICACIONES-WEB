import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { Sesion } from './sesion.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  iniciarSesion(username: string, contrasena: string): Promise<Sesion> {
    return firstValueFrom(
      this.http.post<Sesion>(`${this.api}/api/autenticacion/iniciar-sesion`, { username, contrasena })
    );
  }
}
