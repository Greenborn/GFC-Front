import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import axios from 'axios';

import { CompressedPhotos } from '../models/compressed_photos.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class CompressedPhotosService extends ApiService<CompressedPhotos> {

  constructor(config: ConfigService) {
    super('compressed-photos', config)
  }

  getCompressedPhotos(contestId: number): Observable<CompressedPhotos> {
    const url = `${this.config.nodeApiBaseUrl}contest/compressed-photos?id=${contestId}`;
    return from(axios.get<CompressedPhotos>(url).then(r => r.data));
  }

  get template(): CompressedPhotos {
    return {
      download_url: undefined
    }
  }
}
