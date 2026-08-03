import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import axios from 'axios';
import { Image } from '../models/image.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService extends ApiService<Image> {

  constructor(config: ConfigService) {
    super('images', config)
    this.unwrapResponse = 'data'
   }

   get template(): Image {
    return {
      id: undefined,
      code: undefined,
      title: undefined,
      profile_id: undefined,
      url:'',
      photo_base64: undefined
    }
  }

   postContestUpload<K = { image: any, contest_result: any }>(model: {
     contest_id: number;
     section_id: number;
     title: string;
     photo_base64: any;
   }): Observable<K> {
     const url = `${this.getBaseUrl()}/contest-upload`;
     const token = localStorage.getItem(this.config.tokenKey);
     const headers: Record<string, string> = { 'Content-Type': 'application/json' };
     if (token) headers['Authorization'] = 'Bearer ' + token;
     return from(axios.post(url, model, { headers }).then(r => {
       const data = r.data as any;
       return (data?.data ?? data) as K;
     }));
   }
}
