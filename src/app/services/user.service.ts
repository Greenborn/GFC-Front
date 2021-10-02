import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
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
    super('user', http, config, {
      id: undefined,
      username: undefined,
      role_id: undefined,
      profile_id: undefined
    })
   }
   
}
