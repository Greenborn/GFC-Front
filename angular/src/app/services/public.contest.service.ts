import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contest } from '../models/contest.model';
import { ApiSerializedResponse } from '../models/ApiResponse';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class PublicContestService  extends ApiService<Contest> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('public-contest', http, config)
   }

   get template(): Contest {
    return {
      id: undefined,
      name: undefined,
      description: undefined,
      start_date: undefined,
      end_date: undefined,
      max_img_section: 3
    }
  }

  getAll<K = Contest>(getParams: string = '', resource: string = null): Observable<K[]> {
    if (this.fetchAllOnce && this.all != undefined) {
      return new Observable(suscriber => {
        suscriber.next(this.all as K[])
      })
    } else {
      const url = this.config.publicApiUrl(`${resource ?? 'contest'}?${getParams}`)

      const token = localStorage.getItem(this.config.tokenKey);
      const headers = token ? new HttpHeaders({
        'Authorization': 'Bearer ' + token
      }) : new HttpHeaders();

      return this.http.get<ApiSerializedResponse<K>>(url, { headers }).pipe(
        map((data) => {
          if (this.fetchAllOnce) {
            this.all = data.items;
          }
          if (data != null){
            this.all_meta = data._meta;
            return data.items;
          }
          return null;
        })
      )
    }
  }

  get<K = Contest>(id: number, getParams: string = ''): Observable<K> {
    const url = `${this.config.nodeApiBaseUrl}contest/${id}?${getParams}`;
    return this.http.get<K>(url);
  }
}