import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private baseUrl = 'http://localhost:5000';

  get<T>(ruta: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${ruta}`);
  }

  post<T>(ruta: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${ruta}`, body);
  }

  put<T>(ruta: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${ruta}`, body);
  }

  delete<T>(ruta: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${ruta}`);
  }
}
