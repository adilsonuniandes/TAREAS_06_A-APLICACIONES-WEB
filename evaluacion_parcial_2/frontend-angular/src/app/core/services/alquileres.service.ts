import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

@Injectable({ providedIn: 'root' })
export class AlquileresService {
  constructor(private api: ApiService) {}

  obtener(): Observable<any[]> {
    return this.api.get<any[]>('/api/alquileres');
  }

  crear(body: any): Observable<any> {
    return this.api.post<any>('/api/alquileres', body);
  }

  cerrar(id: number, body: any): Observable<any> {
    return this.api.put<any>(`/api/alquileres/${id}/cerrar`, body);
  }
}
