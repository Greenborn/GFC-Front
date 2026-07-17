import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import axios from 'axios';
import { Role } from '../models/role.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends ApiService<Role> {

  constructor(config: ConfigService) {
    super('role', config)
    this.fetchAllOnce = true
  }

  getAll<K = Role>(getParams = '', resource: string | null = null): Observable<K[]> {
    if (this.fetchAllOnce && this.all != undefined) {
      return new Observable<K[]>(subscriber => {
        subscriber.next(this.all as K[]);
      });
    }
    const resourcePath = resource ?? `${this.recurso}/get_all`;
    const url = `${this.config.nodeApiBaseUrl}${resourcePath}${getParams ? `?${getParams}` : ''}`;
    return from(axios.get(url, { headers: this.getHeaders() }).then(r => {
      const data = r.data as any;
      if (this.fetchAllOnce) this.all = data?.items;
      if (data?._meta != null) this.all_meta = data._meta;
      return data?.items ?? data;
    }));
  }

   get template(): Role {
    return {
      id: undefined,
      type: undefined
    }
  }
}
