import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ContestResult } from '../models/contest_result.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContestResultService extends ApiService<ContestResult> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('contest-result', http, config)
  }

  post<K = ContestResult>(model: any, id: number = undefined, getParams: string = ''): Observable<K> {
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

  get template(): ContestResult {
    return {
      id: undefined,
      contest_id: undefined,
      image_id: undefined,
      metric_id: undefined,
      section_id: undefined
    }
  }
}
