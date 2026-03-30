import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Footer } from '../models/footer.model';

import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';
@Injectable({
  providedIn: 'root'
})
export class FooterService extends ApiService<Footer>{

  constructor( http: HttpClient,
    config: ConfigService) {
      super('footer', http, config)
     }

   get template(): Footer {
      return {
        id: undefined,
        facebook: undefined,
        instagram: undefined,
        youtube: undefined,
        email: undefined
      }
    }

  /**
   * GET /footer/get?id={id}
   */
  get<K = Footer>(id: number, getParams: string = ''): Observable<K> {
    const token = localStorage.getItem(this.config.tokenKey);
    const headers = token ? { Authorization: 'Bearer ' + token } : {};
    const base = this.config.data.publicApi.replace(/\/$/, '');
    const url = `${base}/footer/get?id=${id}`;

    return this.http.get<{ stat: boolean; item: K; text?: string }>(url, { headers }).pipe(
      map((resp) => {
        if (!resp || !resp.stat) {
          throw new Error(resp?.text || 'No se pudo obtener footer');
        }
        return resp.item;
      })
    );
  }

  /**
   * PUT /footer/edit
   */
  post<K = Footer>(model: K, id: number = undefined, getParams: string = ''): Observable<K> {
    const token = localStorage.getItem(this.config.tokenKey);
    const headers = token ? { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
    const base = this.config.data.publicApi.replace(/\/$/, '');

    if (!id && (model as any).id) {
      id = (model as any).id;
    }

    if (!id) {
      throw new Error('El campo id es obligatorio para editar footer');
    }

    return this.http.put<{ stat: boolean; text?: string }>(`${base}/footer/edit`, model, { headers }).pipe(
      map((resp) => {
        if (!resp || !resp.stat) {
          throw new Error(resp?.text || 'No se pudo actualizar footer');
        }
        return model;
      })
    );
  }
}

