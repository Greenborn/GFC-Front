import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiChangePasswordBody, ApiAdminChangePasswordBody } from '../models/ApiRequest';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';
import { ApiSerializedResponse } from '../models/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiService<User> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('user', http, config)
   }

  private nodeUserUrl(resource: string) {
    return this.config.nodeApiBaseUrl + resource;
  }

  get<K = User>(id: number, getParams: string = ''): Observable<K> {
    return this.http.get<K>(
      this.nodeUserUrl(`${this.recurso}/${id}?${getParams}`)
    );
  }

  getAll<K = User>(getParams: string = '', resource: string = null): Observable<K[]> {
    const url = this.nodeUserUrl(`${resource ?? this.recurso}?${getParams}`);
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

  post<K = User>(model: K, id: number = undefined, getParams: string = ''): Observable<K> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return id == undefined ?
      this.http.post<K>(
        this.nodeUserUrl(`${this.recurso}?${getParams}`),
        model,
        { headers }
      ) :
      this.http.put<K>(
        `${this.nodeUserUrl(this.recurso)}/${id}?${getParams}`,
        model,
        { headers }
      );
  }

  postFormData<K = User>(model: K, id: number = undefined, getParams: string = ''): Observable<K> {
    const f = new FormData();
    for (let key in model) {
      f.append(key, (model as any)[key]);
    }
    return id == undefined ?
      this.http.post<K>(
        this.nodeUserUrl(`${this.recurso}?${getParams}`),
        f
      ) :
      this.http.put<K>(
        `${this.nodeUserUrl(this.recurso)}/${id}?${getParams}`,
        f
      );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(
      `${this.nodeUserUrl(this.recurso)}/${id}`
    );
  }

  put(model: any, id: number, recurso: string = null): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(
      `${this.nodeUserUrl(recurso ?? this.recurso)}/${id}`,
      model,
      { headers }
    );
  }

   get template(): User {
    return {
      id: undefined,
      username: undefined,
      role_id: undefined,
      profile_id: undefined
    }
  }

  changePassword(params: ApiChangePasswordBody, userId: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(
      this.nodeUserUrl(`${this.recurso}/${userId}/password`),
      params,
      { headers }
    );
  }

  updatePassword(params: ApiAdminChangePasswordBody, userId: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(
      this.nodeUserUrl(`${this.recurso}/${userId}/password`),
      params,
      { headers }
    );
  }
   
}
