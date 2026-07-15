import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Section } from '../models/section.model';
import { ApiSerializedResponse } from '../models/ApiResponse';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class SectionService extends ApiService<Section> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('section', http, config)
    // this.fetchAllOnce = true
   }

   get template(): Section {
    return {
      id: undefined,
      name: undefined,
      parent_id: null
    }
  }

  getAll<K = Section>(getParams: string = '', resource: string = null): Observable<K[]> {
    const recurso = resource ?? this.recurso;
    const url = `${this.config.nodeApiBaseUrl}${recurso}?${getParams}`;
    return this.http.get<ApiSerializedResponse<K>>(url).pipe(
      map((data) => {
        if (data != null) {
          this.all_meta = data._meta;
          return data.items;
        }
        return null;
      })
    );
  }

  get<K = Section>(id: number, getParams: string = '') {
    const url = `${this.config.nodeApiBaseUrl}section/${id}?${getParams}`;
    return this.http.get<K>(url);
  }

  post<K = Section>(model: K, id: number = undefined, getParams: string = ''): Observable<K> {
    const headers = { 'Content-Type': 'application/json' };
    const url = `${this.config.nodeApiBaseUrl}section${id ? '/' + id : ''}?${getParams}`;
    return id == undefined
      ? this.http.post<K>(url, model, { headers })
      : this.http.put<K>(url, model, { headers });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.config.nodeApiBaseUrl}section/${id}`);
  }
}
