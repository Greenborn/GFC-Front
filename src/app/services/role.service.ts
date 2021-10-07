import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role } from '../models/Role.model';
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
   }

   get template(): Role {
    return {
      id: undefined,
      type: undefined
    }
  }
}
