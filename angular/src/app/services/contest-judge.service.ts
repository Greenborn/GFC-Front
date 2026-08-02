import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable, from } from 'rxjs';
import { ContestJudge } from '../models/contest_judge.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContestJudgeService extends ApiService<ContestJudge> {

  constructor(config: ConfigService) {
    super('contest-judge', config)
    this.customBaseUrl = config.data.nodeApiBaseUrl
    this.unwrapResponse = 'items'
  }

  get template(): ContestJudge {
    return {
      id: undefined,
      contest_id: undefined,
      user_id: undefined,
    }
  }

  getAll<K = ContestJudge>(getParams = '', resource: string | null = null): Observable<K[]> {
    let params = getParams;
    const uniqueId = localStorage.getItem('sso_client_unique_id');
    if (uniqueId) {
      const separator = params.includes('?') ? '&' : '?';
      params += separator + 'unique_id=' + encodeURIComponent(uniqueId);
    }
    const path = this.getPath(resource);
    const url = `${this.getBaseUrl()}${path}?${params}`;
    return from(axios.get(url, { headers: this.getHeaders() }).then(r => {
      const data = r.data as any;
      const items = data?.items ?? data;
      if (data?._meta != null) this.all_meta = data._meta;
      return items;
    }));
  }
}
