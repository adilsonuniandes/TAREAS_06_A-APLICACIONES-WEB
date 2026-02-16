import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';

export interface RolApi {
  rolId: number;
  nombre: string; // administrador | supervisor | empleado
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  constructor(private api: BaseApiService) {}

  listar(){ return this.api.get<RolApi[]>('/api/roles'); }
}
