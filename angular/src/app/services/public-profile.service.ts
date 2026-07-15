import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Profile } from '../models/profile.model';
import { ApiSerializedResponse } from '../models/ApiResponse';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class PublicProfileService extends ApiService<Profile> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('public-profile', http, config)
   }

   get template(): Profile {
    return {
      id: undefined,
      name: undefined,
      last_name: undefined,
      fotoclub_id: undefined,
      executive: undefined,
      executive_rol: undefined
    }
  }

  getAll<K = Profile>(getParams: string = '', resource: string = null): Observable<K[]> {
    const url = `${this.config.nodeApiBaseUrl}${resource ?? 'profile'}?${getParams}`;
    return this.http.get<ApiSerializedResponse<K>>(url).pipe(
      map((data) => {
        if (data != null) {
          this.all_meta = data._meta;
          return data.items;
        }
        return null;
      })
    );
  }

  get<K = Profile>(id: number, getParams: string = ''): Observable<K> {
    const url = `${this.config.nodeApiBaseUrl}profile/${id}?${getParams}`;
    return this.http.get<K>(url);
  }
}
