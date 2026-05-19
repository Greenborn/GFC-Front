import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContestSection } from '../models/contest_section.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContestSectionService extends ApiService<ContestSection> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('contest-section', http, config)
    // this.fetchAllOnce = true
   }

   get template(): ContestSection {
    return {
      id: undefined,
      contest_id: undefined,
      section_id: undefined
    }
  }

  post<K = ContestSection>(model: K, id: number = undefined, getParams: string = ''): Observable<K> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = id == undefined
      ? `${this.config.nodeApiBaseUrl}contest-section?${getParams}`
      : `${this.config.nodeApiBaseUrl}contest-section/${id}?${getParams}`;

    return id == undefined
      ? this.http.post<K>(url, model, { headers })
      : this.http.put<K>(url, model, { headers });
  }
}
