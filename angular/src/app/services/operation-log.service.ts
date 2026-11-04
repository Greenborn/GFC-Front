import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import axios from 'axios';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

export interface OperationLog {
  id?: number;
  id_usuario?: number;
  username?: string;
  evento?: string;
  meta_data?: any;
  date_time?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OperationLogService extends ApiService<OperationLog> {

  constructor(config: ConfigService) {
    super('operation-log', config)
  }

  get template(): OperationLog {
    return {
      id: undefined,
      id_usuario: undefined,
      evento: undefined,
      meta_data: undefined,
      date_time: undefined,
    }
  }

  getAllPaged(params: {
    page?: number;
    perPage?: number;
    sort?: string;
    sortDir?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, string>;
  }): Observable<{
    items: any[];
    _meta?: any;
    _links?: any;
  }> {
    const qp: string[] = [];
    if (params.page != null) qp.push(`page=${params.page}`);
    if (params.perPage != null) qp.push(`per-page=${params.perPage}`);
    if (params.sort) qp.push(`sort=${encodeURIComponent(params.sort)}`);
    if (params.sortDir) qp.push(`sort_dir=${params.sortDir}`);
    if (params.search) qp.push(`search=${encodeURIComponent(params.search)}`);
    if (params.filters) {
      for (const [k, v] of Object.entries(params.filters)) {
        if (v != null && v !== '') qp.push(`filter[${encodeURIComponent(k)}]=${encodeURIComponent(v)}`);
      }
    }
    const url = `${this.config.nodeApiBaseUrl}operation-log/get_all?${qp.join('&')}`;
    return from(axios.get(url).then(r => r.data as any));
  }
}
