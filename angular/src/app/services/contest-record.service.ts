import { Injectable } from '@angular/core';
import axios from 'axios';
import { ContestRecord } from '../concursos/concurso-detail/contest-records/models/contest.record';
import { ConfigService } from './config/config.service';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContestRecordService {

  constructor(
    private config: ConfigService
  ) {}

  private getHeaders() {
    return {
      'Authorization': 'Bearer ' + localStorage.getItem(this.config.data.appName + 'token'),
      'Content-Type': 'application/json'
    };
  }

  private getBaseUrl(): string {
    return this.config.nodeApiBaseUrl + 'contest-record';
  }

  /**
   * Listar Contest Records
   * GET /api/contest-record
   */
  getAll(params?: { page?: number, perPage?: number, sort?: string, contestId?: number }): Observable<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.perPage) queryParams.append('per-page', params.perPage.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.contestId) queryParams.append('filter[contest_id]', params.contestId.toString());

    const url = `${this.getBaseUrl()}?${queryParams.toString()}`;
    return from(axios.get(url, { headers: this.getHeaders() }).then(res => res.data));
  }

  /**
   * Obtener Contest Record por ID
   * GET /api/contest-record/:id
   */
  get(id: number): Observable<ContestRecord> {
    const url = `${this.getBaseUrl()}/${id}`;
    return from(axios.get(url, { headers: this.getHeaders() }).then(res => res.data));
  }

  /**
   * Crear Contest Record
   * POST /api/contest-record
   */
  post(data: ContestRecord): Observable<any> {
    return from(
      axios.post(this.getBaseUrl(), data, { headers: this.getHeaders() })
        .then(res => res.data)
    );
  }

  /**
   * Actualizar Contest Record (Completo)
   * PUT /api/contest-record/:id
   */
  put(data: ContestRecord, id: number): Observable<any> {
    const url = `${this.getBaseUrl()}/${id}`;
    return from(
      axios.put(url, data, { headers: this.getHeaders() })
        .then(res => res.data)
    );
  }

  /**
   * Actualizar Contest Record (Parcial)
   * PATCH /api/contest-record/:id
   */
  patch(data: Partial<ContestRecord>, id: number): Observable<any> {
    const url = `${this.getBaseUrl()}/${id}`;
    return from(
      axios.patch(url, data, { headers: this.getHeaders() })
        .then(res => res.data)
    );
  }

  /**
   * Eliminar Contest Record
   * DELETE /api/contest-record/:id
   */
  delete(id: number): Observable<any> {
    const url = `${this.getBaseUrl()}/${id}`;
    return from(
      axios.delete(url, { headers: this.getHeaders() })
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
