import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class CreateUserService extends ApiService<User> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('auth/register', http, config)
   }

   get template(): any {
    return {}
   }

   post<K = User>(model: any, id: number = undefined, getParams: string = '', headers?: HttpHeaders): Observable<K> {
    const h = headers ?? new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.config.nodeApiBaseUrl}${this.recurso}`;
    return id == undefined
      ? this.http.post<K>(url, model, { headers: h })
      : this.http.put<K>(url, model, { headers: h });
   }
   
}
