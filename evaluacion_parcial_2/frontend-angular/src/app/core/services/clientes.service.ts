import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  constructor(private api: ApiService) {}

  obtener(): Observable<any[]> {
    return this.api.get<any[]>('/api/clientes');
  }

  crear(body: any): Observable<any> {
    return this.api.post<any>('/api/clientes', body);
  }

  eliminar(id: number): Observable<void> {
    return this.api.delete<void>(`/api/clientes/${id}`);
  }
}
