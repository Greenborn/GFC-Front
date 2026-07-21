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
}
