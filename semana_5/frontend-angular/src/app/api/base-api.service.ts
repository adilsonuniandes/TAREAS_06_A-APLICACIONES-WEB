import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  api = environment.apiBaseUrl;
  constructor(protected http: HttpClient) {}

  get<T>(url: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${this.api}${url}`));
  }
  post<T>(url: string, body: any): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${this.api}${url}`, body));
  }
  put<T>(url: string, body: any): Promise<T> {
    return firstValueFrom(this.http.put<T>(`${this.api}${url}`, body));
  }
  delete<T>(url: string): Promise<T> {
    return firstValueFrom(this.http.delete<T>(`${this.api}${url}`));
  }
}
