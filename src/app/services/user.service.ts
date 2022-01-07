import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ApiChangePasswordBody } from '../models/ApiRequest';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

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

   get template(): User {
    return {
      id: undefined,
      username: undefined,
      role_id: undefined,
      profile_id: undefined
    }
  }

  changePassword(params: ApiChangePasswordBody, userId: number): Observable<any> {
    return super.put(params, userId, 'change-password')
  }
   
}
