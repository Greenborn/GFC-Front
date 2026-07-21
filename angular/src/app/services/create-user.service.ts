import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import axios from 'axios';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class CreateUserService extends ApiService<User> {

  constructor(config: ConfigService) {
    super('auth/register', config)
   }

   get template(): any {
    return {}
   }

   post<K = User>(model: any, id: number | undefined = undefined, getParams = '', headers?: Record<string, string>): Observable<K> {
    const h = { 'Content-Type': 'application/json', ...headers };
    const url = `${this.getBaseUrl()}${this.recurso}`;
    const request = id == undefined
      ? axios.post(url, model, { headers: h })
      : axios.put(url, model, { headers: h });
    return from(request.then(r => r.data));
   }
}
