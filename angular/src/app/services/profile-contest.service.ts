import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
    const endpoint = resource === 'profile-registrable'
      ? `${this.config.nodeApiBaseUrl}${resource}?${getParams}`
      : `${this.config.apiUrl(`${resource ?? this.recurso}?${getParams}`)}`;

    return this.http.get<K[]>(endpoint);
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
