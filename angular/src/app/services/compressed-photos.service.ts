import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CompressedPhotos } from '../models/compressed_photos.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class CompressedPhotosService extends ApiService<CompressedPhotos> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('compressed-photos', http, config)
  }

  get template(): CompressedPhotos {
    return {
      download_url: undefined
    }
  }
}
