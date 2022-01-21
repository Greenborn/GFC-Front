import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InfoCentro } from '../models/info_centro.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class PublicInfoCentroService  extends ApiService<InfoCentro> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('public-info-centro', http, config)
   }

   get template(): InfoCentro {
    return {
      id: undefined,
      title: '',
      content: '',
      img_url: undefined
    }
  }
}