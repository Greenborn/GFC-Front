import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

   get template(): Role {
    return {
      id: undefined,
      type: undefined
    }
  }
}
