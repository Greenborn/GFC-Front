import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import axios from 'axios';
import { ApiChangePasswordBody, ApiAdminChangePasswordBody } from '../models/ApiRequest';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiService<User> {

  constructor(config: ConfigService) {
    super('user', config)
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
    return from(axios.put(
      `${this.config.nodeApiBaseUrl}user/${userId}/password`,
      params,
      { headers: { 'Content-Type': 'application/json' } }
    ).then(r => r.data));
  }

  updatePassword(params: ApiAdminChangePasswordBody, userId: number): Observable<any> {
    return from(axios.put(
      `${this.config.nodeApiBaseUrl}user/${userId}/password`,
      params,
      { headers: { 'Content-Type': 'application/json' } }
    ).then(r => r.data));
  }

  getAllPaged(params: {
    page?: number;
    perPage?: number;
    sort?: string;
    sortDir?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, string>;
  }): Observable<{
    items: any[];
    profile: any[];
    role: any[];
    fotoclub: any[];
    _meta?: any;
    _links?: any;
  }> {
    const qp: string[] = [];
    if (params.page != null) qp.push(`page=${params.page}`);
    if (params.perPage != null) qp.push(`per-page=${params.perPage}`);
    if (params.sort) qp.push(`sort=${encodeURIComponent(params.sort)}`);
    if (params.sortDir) qp.push(`sort_dir=${params.sortDir}`);
    if (params.search) qp.push(`search=${encodeURIComponent(params.search)}`);
    if (params.filters) {
      for (const [k, v] of Object.entries(params.filters)) {
        if (v != null && v !== '') qp.push(`filter[${encodeURIComponent(k)}]=${encodeURIComponent(v)}`);
      }
    }
    const url = `${this.config.nodeApiBaseUrl}user/get_all?${qp.join('&')}`;
    return from(axios.get(url).then(r => r.data as any));
  }
}
