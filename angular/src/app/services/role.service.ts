import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSerializedResponse } from '../models/ApiResponse';
import { Role } from '../models/role.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends ApiService<Role> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('role', http, config)
    this.fetchAllOnce = true
  }

  private nodeRoleUrl(resource: string) {
    return this.config.nodeApiBaseUrl + resource;
  }

  get<K = Role>(id: number, getParams: string = ''): Observable<K> {
    return this.http.get<K>(
      this.nodeRoleUrl(`${this.recurso}/${id}?${getParams}`)
    );
  }

  getAll<K = Role>(getParams: string = '', resource: string = null): Observable<K[]> {
    const resourcePath = resource ?? `${this.recurso}/get_all`;
    const url = this.nodeRoleUrl(`${resourcePath}${getParams ? `?${getParams}` : ''}`);
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

  post<K = Role>(model: K, id: number = undefined, getParams: string = ''): Observable<K> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return id == undefined ?
      this.http.post<K>(
        this.nodeRoleUrl(`${this.recurso}?${getParams}`),
        model,
        { headers }
      ) :
      this.http.put<K>(
        `${this.nodeRoleUrl(this.recurso)}/${id}?${getParams}`,
        model,
        { headers }
      );
  }

  postFormData<K = Role>(model: K, id: number = undefined, getParams: string = ''): Observable<K> {
    const f = new FormData();
    for (let key in model) {
      f.append(key, (model as any)[key]);
    }
    return id == undefined ?
      this.http.post<K>(
        this.nodeRoleUrl(`${this.recurso}?${getParams}`),
        f
      ) :
      this.http.put<K>(
        `${this.nodeRoleUrl(this.recurso)}/${id}?${getParams}`,
        f
      );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(
      `${this.nodeRoleUrl(this.recurso)}/${id}`
    );
  }

  put(model: any, id: number, recurso: string = null): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(
      `${this.nodeRoleUrl(recurso ?? this.recurso)}/${id}`,
      model,
      { headers }
    );
  }

  get template(): Role {
    return {
      id: undefined,
      type: undefined
    }
  }
}
