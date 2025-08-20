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
    protected http: HttpClient,
    protected config: ConfigService
  ) {
    super('compressed-photos', http, config)
  }

  getCompressedPhotos(contestId: number) {
    const baseUrl = this.config.nodeApiBaseUrl;
    const url = `${baseUrl}contest/compressed-photos?id=${contestId}`;
    return this.http.get<CompressedPhotos>(url);
  }

  get template(): CompressedPhotos {
    return {
      download_url: undefined
    }
  }
}
