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
      params += (params ? '&' : '') + 'unique_id=' + encodeURIComponent(uniqueId);
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

  post<K = ContestJudge>(model: K, id: number | undefined = undefined, getParams = ''): Observable<K> {
    let params = getParams;
    const uniqueId = localStorage.getItem('sso_client_unique_id');
    if (uniqueId) {
      params += (params ? '&' : '') + 'unique_id=' + encodeURIComponent(uniqueId);
    }
    const path = this.getPath();
    const url = id == undefined
      ? `${this.getBaseUrl()}${path}?${params}`
      : `${this.getBaseUrl()}${path}/${id}?${params}`;
    const headers = { ...this.getHeaders(), 'Content-Type': 'application/json' };
    const request = id == undefined
      ? axios.post(url, model, { headers })
      : axios.put(url, model, { headers });
    return from(request.then(r => r.data));
  }

  heartbeat(contest_id: number): Promise<any> {
    const url = `${this.getBaseUrl()}${this.getPath()}/heartbeat`;
    return axios.post(url, { contest_id }, {
      headers: { ...this.getHeaders(), 'Content-Type': 'application/json' }
    }).then(r => r.data ?? { success: true }).catch(error => {
      const status = error?.response?.status ?? 0;
      if (status === 409) {
        return { success: false, code: 409 };
      }
      console.error('Error al reportar juez activo', error);
      return { success: false, code: status };
    });
  }

  getActive(contest_id: number): Promise<{ items: ContestActive[]; is_judging: boolean }> {
    const url = `${this.getBaseUrl()}${this.getPath()}/active?contest_id=${contest_id}`;
    return axios.get(url, { headers: this.getHeaders() }).then(r => {
      const data = r.data ?? {};
      return {
        items: data?.items ?? [],
        is_judging: data?.is_judging === true,
      };
    }).catch(error => {
      console.error('Error al consultar jueces activos', error);
      return { items: [], is_judging: false };
    });
  }
}

export interface ContestActive {
  user_id: number;
  last_active: number;
  user?: {
    id: number;
    username: string;
    email: string;
    profile_id: number;
  };
}
