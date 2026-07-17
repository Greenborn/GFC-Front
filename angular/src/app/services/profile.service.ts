import { Injectable } from '@angular/core';
import { Profile } from '../models/profile.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends ApiService<Profile> {

  constructor(config: ConfigService) {
    super('profile', config)
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
