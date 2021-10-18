import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSerializedResponse } from '../models/ApiResponse';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export abstract class ApiService<T> {

  
  constructor(
    @Inject(String) private recurso: string,
    private  http: HttpClient,
    private config: ConfigService,
    // private _template: T
  ) { }

  abstract get template(): T;

  get<K = T>(id: number, getParams: string = ''): Observable<K> {
    console.log('get', this.recurso, id)
    return this.http.get<K>(
      this.config.apiUrl(`${this.recurso}/${id}?${getParams}`)
    )
  }

  // https://www.yiiframework.com/doc/guide/2.0/en/rest-response-formatting
  getAll<K = T>(getParams: string = ''): Observable<K[]> {
    const url = this.config.apiUrl(`${this.recurso}?${getParams}`)
    // console.log('getting', url))
    return this.http.get<ApiSerializedResponse<K>>(url).pipe(
      map((data) => {
        console.log('get all', url, data)
        return data.items
      })
    )
  }

  post(model: T, id: number = undefined, getParams: string = ''): Observable<T> {
    console.log('posting', model, 'id: ', id)
    const headers = new HttpHeaders({ 'Content-Type':  'application/json' })
    return id == undefined ? 
      this.http.post<T>(
        this.config.apiUrl(`${this.recurso}?${getParams}`), 
        model,
        { headers }
      ) :
      this.http.put<T>(
        `${this.config.apiUrl(this.recurso)}/${id}?${getParams}`, 
        model,
        { headers }
      ) 
  }

  delete(id: number): Observable<any> {
    return this.http.delete(
      `${this.config.apiUrl(this.recurso)}/${id}`
    )
  }

}
