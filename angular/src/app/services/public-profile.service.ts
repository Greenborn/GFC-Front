import { Injectable } from '@angular/core';
import { Profile } from '../models/profile.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class PublicProfileService extends ApiService<Profile> {

  constructor(config: ConfigService) {
    super('public-profile', config)
    this.apiPath = 'profile'
   }

   get template(): Profile {
    return {
      id: undefined,
      name: undefined,
      last_name: undefined,
      fotoclub_id: undefined,
      executive: undefined,
      executive_rol: undefined
    }
  }
}
