import { Injectable } from '@angular/core';
import axios from 'axios';
import { ContestRecord } from '../concursos/concurso-detail/contest-records/models/contest.record';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContestRecordService extends ApiService<ContestRecord> {

  constructor(config: ConfigService) {
    super('contest-record', config)
  }

  getAll<K = any>(getParams?: string | { page?: number, perPage?: number, sort?: string, contestId?: number }): Observable<any> {
    const params = typeof getParams === 'object' ? getParams : undefined;
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.perPage) queryParams.append('per-page', params.perPage.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.contestId) queryParams.append('filter[contest_id]', params.contestId.toString());

    const uniqueId = localStorage.getItem('sso_client_unique_id');
    if (uniqueId) {
      queryParams.append('unique_id', uniqueId);
    }

    const url = `${this.getBaseUrl()}${this.getPath()}?${queryParams.toString()}`;
    return from(axios.get(url, { headers: this.getHeaders() }).then(res => res.data));
  }

  patch(data: Partial<ContestRecord>, id: number): Observable<any> {
    const url = `${this.getBaseUrl()}${this.getPath()}/${id}`;
    return from(
      axios.patch(url, data, { headers: this.getHeaders() })
        .then(res => res.data)
    );
  }

  get template(): ContestRecord {
    return {
      id: undefined,
      url: undefined,
      object: undefined,
      contest_id: undefined,
    };
  }
}
