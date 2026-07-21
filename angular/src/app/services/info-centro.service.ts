import { Injectable } from '@angular/core';
import { InfoCentro } from '../models/info_centro.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class InfoCentroService  extends ApiService<InfoCentro> {

  constructor(config: ConfigService) {
    super('info-centro', config)
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
