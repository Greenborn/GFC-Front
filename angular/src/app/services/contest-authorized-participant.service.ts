import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable, from } from 'rxjs';
import {
  ContestAuthorizedParticipant,
  ContestAuthorizedParticipantsParseResult,
  ContestAuthorizedParticipantsStatus
} from '../models/contest_authorized_participant.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContestAuthorizedParticipantService extends ApiService<ContestAuthorizedParticipant> {

  constructor(config: ConfigService) {
    super('contest-authorized-participants', config)
    this.customBaseUrl = config.data.nodeApiBaseUrl
    this.unwrapResponse = 'items'
  }

  get template(): ContestAuthorizedParticipant {
    return {
      id: undefined,
      contest_id: undefined,
      dni: ''
    }
  }

  getAll<K = ContestAuthorizedParticipant>(getParams = '', resource: string | null = null): Observable<K[]> {
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

  parseFile(contest_id: number, file: File): Observable<ContestAuthorizedParticipantsParseResult> {
    const formData = new FormData();
    formData.append('contest_id', String(contest_id));
    formData.append('file', file);
    const url = `${this.getBaseUrl()}${this.getPath()}/parse`;
    return from(axios.post(url, formData, { headers: this.getHeaders() }).then(r => r.data));
  }

  confirmImport(contest_id: number, rows: ContestAuthorizedParticipant[]): Observable<any> {
    const url = `${this.getBaseUrl()}${this.getPath()}/confirm`;
    const headers = { ...this.getHeaders(), 'Content-Type': 'application/json' };
    return from(axios.post(url, { contest_id, rows }, { headers }).then(r => r.data));
  }

  getStatus(contest_id: number): Observable<ContestAuthorizedParticipantsStatus> {
    const url = `${this.getBaseUrl()}${this.getPath()}/status?contest_id=${contest_id}`;
    return from(axios.get(url, { headers: this.getHeaders() }).then(r => r.data));
  }
}
