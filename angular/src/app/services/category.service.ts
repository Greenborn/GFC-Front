import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category } from '../models/category.model';
import { ApiSerializedResponse } from '../models/ApiResponse';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends ApiService<Category> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('category', http, config)
    this.fetchAllOnce = true
   }

   get template(): Category {
    return {
      id: undefined,
      name: undefined
    }
  }

  getAll<K = Category>(getParams: string = '', resource: string = null): Observable<K[]> {
    if (this.fetchAllOnce && this.all != undefined) {
      return new Observable(suscriber => {
        suscriber.next(this.all as K[])
      })
    }
    const recurso = resource ?? this.recurso;
    const url = `${this.config.nodeApiBaseUrl}${recurso}?${getParams}`;
    return this.http.get<ApiSerializedResponse<K>>(url).pipe(
      map((data) => {
        if (this.fetchAllOnce) {
          this.all = data?.items;
        }
        if (data != null) {
          this.all_meta = data._meta;
          return data.items;
        }
        return null;
      })
    );
  }

  get<K = Category>(id: number, getParams: string = ''): Observable<K> {
    const url = `${this.config.nodeApiBaseUrl}category/${id}?${getParams}`;
    return this.http.get<K>(url);
  }
}
