import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSerializedResponse } from '../models/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class RankingService extends ApiService<any> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('ranking', http, config)
    this.fetchAllOnce = true
   }

  getAll<K = any>(getParams: string = '', resource: string = null): Observable<K[]> {
    if (this.fetchAllOnce && this.all != undefined) {
      return new Observable(subscriber => {
        subscriber.next(this.all as K[])
      })
    }

    const url = this.config.nodeApiBaseUrl + `${resource ?? this.recurso}?${getParams}`
    return this.http.get<ApiSerializedResponse<K>>(url).pipe(
      map((data) => {
        if (this.fetchAllOnce) {
          this.all = data.items
        }
        if (data != null) {
          this.all_meta = data._meta
          return data.items
        }
        return null
      })
    )
  }

   get template(): any {
    return {
      "profiles": undefined,
      "fotoclubs": undefined
    }
  }

  recalculateRanking() {
    const token = localStorage.getItem(this.config.tokenKey);
    const headers = token ? { Authorization: 'Bearer ' + token } : {};
    return this.http.post(this.config.publicApiUrl('results/recalcular-ranking'), {}, { headers });
  }

  getDetalleRanking(profile_id: number, contest_id?: number, year?: number): Observable<any> {
    const url = `${this.config.nodeApiBaseUrl}ranking/detalle`;
    let params = new HttpParams().set('profile_id', String(profile_id));
    if (contest_id != null) params = params.set('contest_id', String(contest_id));
    if (year != null) params = params.set('year', String(year));
    return this.http.get<any>(url, { params });
  }
}