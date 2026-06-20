import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RankingService extends ApiService<any> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('ranking', http, config)
   }

  getAll<K = any>(getParams: string = '', resource: string = null): Observable<K> {
    const url = `${this.config.nodeApiBaseUrl}${resource ?? this.recurso}?${getParams}`;
    return this.http.get<any>(url).pipe(
      map(data => data?.items ?? data)
    );
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

  getDetalleRanking(profile_id: number, contest_id?: number, year?: number, section_id?: number): Observable<any> {
    const url = `${this.config.nodeApiBaseUrl}ranking/detalle`;
    let params = new HttpParams().set('profile_id', String(profile_id));
    if (contest_id != null) params = params.set('contest_id', String(contest_id));
    if (year != null) params = params.set('year', String(year));
    if (section_id != null) params = params.set('section_id', String(section_id));
    return this.http.get<any>(url, { params });
  }
}