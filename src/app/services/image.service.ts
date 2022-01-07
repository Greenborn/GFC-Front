import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Image } from '../models/image.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService extends ApiService<Image> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('image', http, config)
   }

   get template(): Image {
    return {
      id: undefined,
      code: undefined,
      title: undefined,
      profile_id: undefined
    }
  }
}
