import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';

export interface Empleado {
  empleadoId: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
}

@Injectable({ providedIn: 'root' })
export class EmpleadosService {
  constructor(private api: BaseApiService) {}

  listar(){ return this.api.get<Empleado[]>('/api/empleados'); }
  crear(payload: any){ return this.api.post<void>('/api/empleados', payload); }
  actualizar(id: number, payload: any){ return this.api.put<void>(`/api/empleados/${id}`, payload); }
  eliminar(id: number){ return this.api.delete<void>(`/api/empleados/${id}`); }
}
