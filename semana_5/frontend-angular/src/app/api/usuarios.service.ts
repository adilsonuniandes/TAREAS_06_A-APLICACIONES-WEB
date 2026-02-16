import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';

export interface Usuario {
  usuarioId: number;
  username: string;
  activo: boolean;
  roles?: string[]; // opcional si el backend lo devuelve
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(private api: BaseApiService) {}

  listar(){ return this.api.get<Usuario[]>('/api/usuarios'); }
  crear(payload: any){ return this.api.post<void>('/api/usuarios', payload); }
  actualizar(id: number, payload: any){ return this.api.put<void>(`/api/usuarios/${id}`, payload); }
  eliminar(id: number){ return this.api.delete<void>(`/api/usuarios/${id}`); }
}
