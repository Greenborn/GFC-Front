import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import axios from 'axios';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class RankingService extends ApiService<any> {

  constructor(config: ConfigService) {
    super('ranking', config)
   }

   get template(): any {
    return {
      "profiles": undefined,
      "fotoclubs": undefined
    }
  }

  recalculateRanking(): Observable<any> {
    const token = localStorage.getItem(this.config.tokenKey);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return from(axios.post(this.config.publicApiUrl('results/recalcular-ranking'), {}, { headers }).then(r => r.data));
  }

  getDetalleRanking(profile_id: number, contest_id?: number, year?: number, section_id?: number): Observable<any> {
    const params = new URLSearchParams();
    params.set('profile_id', String(profile_id));
    if (contest_id != null) params.set('contest_id', String(contest_id));
    if (year != null) params.set('year', String(year));
    if (section_id != null) params.set('section_id', String(section_id));
    const url = `${this.config.nodeApiBaseUrl}ranking/detalle?${params.toString()}`;
    return from(axios.get(url).then(r => r.data));
  }
}
