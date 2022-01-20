import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Fotoclub } from '../models/fotoclub.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class FotoclubService extends ApiService<Fotoclub> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('fotoclub', http, config)
    // this.fetchAllOnce = true
   }

   get template(): Fotoclub {
    return {
      id: undefined,
      name: undefined,
      description: undefined,
      facebook: undefined,
      instagram: undefined,
      email: undefined,
      photo_url: undefined,
    }
  }
}
