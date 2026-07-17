import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import axios from 'axios';
import { Fotoclub } from '../models/fotoclub.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class FotoclubService extends ApiService<Fotoclub> {

  constructor(config: ConfigService) {
    super('fotoclub', config)
    this.useAuthHeader = true
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
      enabled: true,
      organization_type: 'INTERNO',
      mostrar_en_ranking: true,
    }
  }

  private fotoclubBaseUrl() {
    return this.config.data.publicApi.replace(/\/$/, '');
  }

  getAll<K = Fotoclub>(getParams = '', resource: string | null = null): Observable<K[]> {
    const token = localStorage.getItem(this.config.tokenKey);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const url = this.fotoclubBaseUrl() + '/fotoclub/get_all' + (getParams ? '?' + getParams : '');
    return from(axios.get<{items: K[]}>(url, { headers }).then(r => r.data.items));
  }

  get<K = Fotoclub>(id: number, getParams = ''): Observable<K> {
    const token = localStorage.getItem(this.config.tokenKey);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const url = this.fotoclubBaseUrl() + `/fotoclub/${id}`;
    return from(axios.get<K>(url, { headers }).then(r => r.data));
  }

  post<K = Fotoclub>(model: K, id: number | undefined = undefined, getParams = ''): Observable<K> {
    const token = localStorage.getItem(this.config.tokenKey);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const request = id === undefined
      ? axios.post(this.fotoclubBaseUrl() + '/fotoclub/create', model, { headers })
      : axios.put(this.fotoclubBaseUrl() + '/fotoclub/edit', model, { headers });
    return from(request.then(r => r.data));
  }
}
