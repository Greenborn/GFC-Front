import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Footer } from '../models/footer.model';

import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';
@Injectable({
  providedIn: 'root'
})
export class FooterService extends ApiService<Footer>{

  constructor( http: HttpClient,
    config: ConfigService) {
      super('footer', http, config)
     }

     get template(): Footer {
      return {
        id: undefined,
        facebook: undefined,
        instagram: undefined,
        youtube: undefined,
        email: undefined
      }
    }
}
