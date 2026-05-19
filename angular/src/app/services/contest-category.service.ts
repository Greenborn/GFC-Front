import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContestCategory } from '../models/contest_category.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContestCategoryService extends ApiService<ContestCategory> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('contest-category', http, config)
    // this.fetchAllOnce = true
   }

   get template(): ContestCategory {
    return {
      id: undefined,
      contest_id: undefined,
      category_id: undefined
    }
  }

  post<K = ContestCategory>(model: K, id: number = undefined, getParams: string = ''): Observable<K> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = id == undefined
      ? `${this.config.nodeApiBaseUrl}contest-category?${getParams}`
      : `${this.config.nodeApiBaseUrl}contest-category/${id}?${getParams}`;

    return id == undefined
      ? this.http.post<K>(url, model, { headers })
      : this.http.put<K>(url, model, { headers });
  }
}
