import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';

export interface Departamento {
  departamentoId: number;
  nombre: string;
  ubicacion?: string | null;
  jefeDepartamento?: string | null;
  extension?: string | null;
}

@Injectable({ providedIn: 'root' })
export class DepartamentosService {
  constructor(private api: BaseApiService) {}

  listar(){ return this.api.get<Departamento[]>('/api/departamentos'); }
  crear(payload: any){ return this.api.post<void>('/api/departamentos', payload); }
  actualizar(id: number, payload: any){ return this.api.put<void>(`/api/departamentos/${id}`, payload); }
  eliminar(id: number){ return this.api.delete<void>(`/api/departamentos/${id}`); }
}
