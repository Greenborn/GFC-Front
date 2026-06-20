import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProfileContest } from '../models/profile_contest';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileContestService extends ApiService<ProfileContest> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('profile-contest', http, config)
   }

  getAll<K = ProfileContest>(getParams: string = '', resource: string = null): Observable<K[]> {
    const endpoint = `${this.config.nodeApiBaseUrl}${resource ?? this.recurso}?${getParams}`;
    return this.http.get<any>(endpoint).pipe(
      map(data => data?.items ?? data)
    );
  }

  get<K = ProfileContest>(id: number, getParams: string = ''): Observable<K> {
    return this.http.get<K>(`${this.config.nodeApiBaseUrl}${this.recurso}/${id}?${getParams}`);
  }

  post<K = ProfileContest>(model: any, id: number = undefined, getParams: string = ''): Observable<K> {
    const url = `${this.config.nodeApiBaseUrl}${this.recurso}?${getParams}`;
    return id == undefined
      ? this.http.post<K>(url, model)
      : this.http.put<K>(url, model);
  }

   get template(): ProfileContest {
    return {
      id: undefined,
      profile_id: undefined,
      contest_id: undefined,
      category_id: undefined
    }
  }
}
