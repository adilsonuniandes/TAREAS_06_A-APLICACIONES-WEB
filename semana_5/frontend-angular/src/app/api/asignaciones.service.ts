import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';

export interface Asignacion {
  asignacionId: number;
  empleadoId: number;
  departamentoId: number;
  fechaAsignacion?: string | null;
  empleado?: { empleadoId:number; nombre:string; apellido:string };
  departamento?: { departamentoId:number; nombre:string };
}

@Injectable({ providedIn: 'root' })
export class AsignacionesService {
  constructor(private api: BaseApiService) {}

  listar(){ return this.api.get<Asignacion[]>('/api/asignaciones'); }
  crear(payload: any){ return this.api.post<void>('/api/asignaciones', payload); }
  eliminar(id: number){ return this.api.delete<void>(`/api/asignaciones/${id}`); }
}
