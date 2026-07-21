import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
    return super.getAll(getParams, resource ?? 'role/get_all');
  }

   get template(): Role {
    return {
      id: undefined,
      type: undefined
    }
  }
}
