import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Profile } from '../models/profile.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends ApiService<Profile> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('profile', http, config)
   }

   get template(): Profile {
    return {
      id: undefined,
      name: undefined,
      last_name: undefined,
      fotoclub_id: undefined
    }
  }
}
