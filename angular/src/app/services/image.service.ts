import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    super('images', http, config)
   }

  post<K = Image>(model: any, id: number = undefined, getParams: string = ''): Observable<K> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.config.nodeApiBaseUrl}${this.recurso}${id != undefined ? '/' + id : ''}?${getParams}`;
    const request = id == undefined
      ? this.http.post<any>(url, model, { headers })
      : this.http.put<any>(url, model, { headers });
    return request.pipe(
      map(data => data?.data ?? data)
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.config.nodeApiBaseUrl}${this.recurso}/${id}`);
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
}
