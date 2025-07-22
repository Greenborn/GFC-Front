import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Fotoclub } from '../models/fotoclub.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FotoclubService extends ApiService<Fotoclub> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('fotoclub', http, config)
    // this.fetchAllOnce = true
   }

   get template(): Fotoclub {
    return {
      id: undefined,
      name: undefined,
      description: undefined,
      facebook: undefined,
      instagram: undefined,
      email: undefined,
      photo_url: undefined,
    }
  }

  getAll<K = Fotoclub>(getParams: string = '', resource: string = null): Observable<K[]> {
    // Usa la base parametrizada para el endpoint y agrega el token de sesión
    const token = localStorage.getItem(this.config.tokenKey);
    const headers = token ? { Authorization: 'Bearer ' + token } : {};
    const url = this.config.data.publicApi.replace(/\/$/, '') + '/api/fotoclub/get_all';
    return this.http.get<{items: K[]}>(url, { headers }).pipe(
      map(resp => resp.items)
    );
  }
}
