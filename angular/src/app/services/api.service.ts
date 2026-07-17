import { Inject, Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import axios from 'axios';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export abstract class ApiService<T> {

  protected fetchAllOnce = false;
  protected all: T[] | undefined;
  all_meta: any;

  protected useAuthHeader = false;
  protected unwrapResponse: 'none' | 'data' | 'items' = 'none';
  protected customBaseUrl = '';
  protected apiPath = '';

  constructor(
    @Inject(String) protected recurso: string,
    protected config: ConfigService,
  ) { }

  abstract get template(): T;

  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.useAuthHeader) {
      const token = localStorage.getItem(this.config.tokenKey);
      if (token) headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
  }

  protected getBaseUrl(): string {
    return this.customBaseUrl || this.config.nodeApiBaseUrl;
  }

  private getPath(resource?: string): string {
    return resource ?? (this.apiPath || this.recurso);
  }

  get<K = T>(id: number, getParams = ''): Observable<K> {
    const url = `${this.getBaseUrl()}${this.getPath()}/${id}?${getParams}`;
    return from(axios.get<K>(url, { headers: this.getHeaders() }).then(r => {
      const data = r.data as any;
      return this.unwrapResponse === 'data' ? (data?.data ?? data) : data;
    }));
  }

  getAll<K = T>(getParams = '', resource: string | null = null): Observable<K[]> {
    if (this.fetchAllOnce && this.all != undefined) {
      return new Observable<K[]>(subscriber => {
        subscriber.next(this.all as any);
      });
    }
    const path = this.getPath(resource);
    const url = `${this.getBaseUrl()}${path}?${getParams}`;
    return from(axios.get(url, { headers: this.getHeaders() }).then(r => {
      const data = r.data as any;
      const items = data?.items ?? data;
      if (this.fetchAllOnce) this.all = items;
      if (data?._meta != null) this.all_meta = data._meta;
      return items;
    }));
  }

  getAllMeta() {
    return this.all_meta;
  }

  post<K = T>(model: K, id: number | undefined = undefined, getParams = ''): Observable<K> {
    const path = this.getPath();
    const url = id == undefined
      ? `${this.getBaseUrl()}${path}?${getParams}`
      : `${this.getBaseUrl()}${path}/${id}?${getParams}`;
    const headers = { ...this.getHeaders(), 'Content-Type': 'application/json' };
    const request = id == undefined
      ? axios.post(url, model, { headers })
      : axios.put(url, model, { headers });
    return from(request.then(r => {
      const data = r.data as any;
      return this.unwrapResponse === 'data' ? (data?.data ?? data) : data;
    }));
  }

  postFormData<K = T>(model: K, id: number | undefined = undefined, getParams = ''): Observable<K> {
    const formData = new FormData();
    for (const key in model) {
      if (Object.prototype.hasOwnProperty.call(model, key)) {
        const value = (model as any)[key];
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      }
    }
    const path = this.getPath();
    const url = id == undefined
      ? `${this.getBaseUrl()}${path}?${getParams}`
      : `${this.getBaseUrl()}${path}/${id}?${getParams}`;
    const request = id == undefined
      ? axios.post(url, formData, { headers: this.getHeaders() })
      : axios.put(url, formData, { headers: this.getHeaders() });
    return from(request.then(r => r.data));
  }

  delete(id: number): Observable<any> {
    return from(axios.delete(`${this.getBaseUrl()}${this.getPath()}/${id}`, { headers: this.getHeaders() }).then(r => r.data));
  }

  put(model: any, id: number, recursoOverride: string | null = null): Observable<any> {
    const headers = { ...this.getHeaders(), 'Content-Type': 'application/json' };
    const path = recursoOverride ?? this.getPath();
    return from(axios.put(`${this.getBaseUrl()}${path}/${id}`, model, { headers }).then(r => r.data));
  }
}
