import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSerializedResponse } from '../models/ApiResponse';
import { Profile } from '../models/profile.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends ApiService<Profile> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('profile', http, config)
   }

  private nodeProfileUrl(resource: string) {
    return this.config.nodeApiBaseUrl + resource;
  }

  get<K = Profile>(id: number, getParams: string = ''): Observable<K> {
    return this.http.get<K>(
      this.nodeProfileUrl(`${this.recurso}/${id}?${getParams}`)
    );
  }

  getAll<K = Profile>(getParams: string = '', resource: string = null): Observable<K[]> {
    const url = this.nodeProfileUrl(`${resource ?? this.recurso}?${getParams}`);
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

  post<K = Profile>(model: K, id: number = undefined, getParams: string = ''): Observable<K> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return id == undefined ?
      this.http.post<K>(
        this.nodeProfileUrl(`${this.recurso}?${getParams}`),
        model,
        { headers }
      ) :
      this.http.put<K>(
        `${this.nodeProfileUrl(this.recurso)}/${id}?${getParams}`,
        model,
        { headers }
      );
  }

  postFormData<K = Profile>(model: K, id: number = undefined, getParams: string = ''): Observable<K> {
    const f = new FormData();
    for (let key in model) {
      f.append(key, (model as any)[key]);
    }
    return id == undefined ?
      this.http.post<K>(
        this.nodeProfileUrl(`${this.recurso}?${getParams}`),
        f
      ) :
      this.http.put<K>(
        `${this.nodeProfileUrl(this.recurso)}/${id}?${getParams}`,
        f
      );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(
      `${this.nodeProfileUrl(this.recurso)}/${id}`
    );
  }

  put(model: any, id: number, recurso: string = null): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(
      `${this.nodeProfileUrl(recurso ?? this.recurso)}/${id}`,
      model,
      { headers }
    );
  }

   get template(): Profile {
    return {
      id: undefined,
      name: undefined,
      last_name: undefined,
      fotoclub_id: undefined,
      executive: undefined,
      executive_rol: undefined
    }
  }
}
