import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import axios from 'axios';
import { Fotoclub } from '../models/fotoclub.model';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class FotoclubService {

  constructor(
    private config: ConfigService
  ) {}

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
    return this.config.nodeApiBaseUrl.replace(/\/$/, '');
  }

  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem(this.config.tokenKey);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
  }

  getAll<K = Fotoclub>(getParams = ''): Observable<K[]> {
    const url = this.fotoclubBaseUrl() + '/fotoclub/get_all' + (getParams ? '?' + getParams : '');
    return from(axios.get<{items: K[]}>(url, { headers: this.getHeaders() }).then(r => r.data.items));
  }

  get<K = Fotoclub>(id: number): Observable<K> {
    const url = this.fotoclubBaseUrl() + `/fotoclub/${id}`;
    return from(axios.get<K>(url, { headers: this.getHeaders() }).then(r => r.data));
  }

  post<K = Fotoclub>(model: K, id: number | undefined = undefined): Observable<K> {
    const headers = { ...this.getHeaders(), 'Content-Type': 'application/json' };
    const request = id === undefined
      ? axios.post(this.fotoclubBaseUrl() + '/fotoclub/create', model, { headers })
      : axios.put(this.fotoclubBaseUrl() + '/fotoclub/edit', model, { headers });
    return from(request.then(r => r.data));
  }

  delete(id: number): Observable<any> {
    const headers = { ...this.getHeaders(), 'Content-Type': 'application/json' };
    return from(axios.delete(this.fotoclubBaseUrl() + `/fotoclub/${id}`, { headers }).then(r => r.data));
  }
}
