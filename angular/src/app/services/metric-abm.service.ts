import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Metric } from '../models/metric.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class MetricAbmService extends ApiService<Metric> {
  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('metric-abm', http, config)
   }

  getAll<K = Metric>(getParams: string = '', resource: string = null): Observable<K[]> {
    const url = `${this.config.nodeApiBaseUrl}${resource ?? this.recurso}?${getParams}`;
    return this.http.get<any>(url).pipe(
      map(data => data?.items ?? data)
    );
  }

  get<K = Metric>(id: number, getParams: string = ''): Observable<K> {
    return this.http.get<any>(`${this.config.nodeApiBaseUrl}${this.recurso}/${id}?${getParams}`).pipe(
      map(data => data?.data ?? data)
    );
  }

  post<K = Metric>(model: any, id: number = undefined, getParams: string = ''): Observable<K> {
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

   get template(): Metric {
    return {
      id: undefined,
      prize: undefined,
      score: undefined,
      organization_type: undefined
    }
  }
}
