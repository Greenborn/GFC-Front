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

  protected fetchAllOnce: boolean = false;
  protected all: any[];
  all_meta:any;
  
  constructor(
    @Inject(String) protected recurso: string,
    protected  http: HttpClient,
    protected config: ConfigService,
    // private _template: T
  ) { }

  abstract get template(): T;

  get<K = T>(id: number, getParams: string = ''): Observable<K> {
    console.log('get', this.recurso, id)
    const useNodeApi = this.recurso === 'contest-category' || this.recurso === 'contest-section' || this.recurso === 'contest-result'
    const url = useNodeApi
      ? `${this.config.nodeApiBaseUrl}${this.recurso}/${id}?${getParams}`
      : this.config.apiUrl(`${this.recurso}/${id}?${getParams}`)

    return this.http.get<K>(url)
  }

  public getAllMeta(){
    return this.all_meta;
  }

  // https://www.yiiframework.com/doc/guide/2.0/en/rest-response-formatting
  getAll<K = T>(getParams: string = '', resource: string = null): Observable<K[]> {

    if (this.fetchAllOnce && this.all != undefined) {
      console.log('get all stored', this.all)
      return new Observable(suscriber => {
        suscriber.next(this.all as K[])
      })
    } else {
      const recurso = resource ?? this.recurso
      const useNodeApi = recurso === 'contest-category' || recurso === 'contest-section' || recurso === 'contest-result'
      const url = useNodeApi
        ? `${this.config.nodeApiBaseUrl}${recurso}?${getParams}`
        : this.config.apiUrl(`${recurso}?${getParams}`)
      // console.log('getting', url))
      return this.http.get<ApiSerializedResponse<K>>(url).pipe(
        map((data) => {
          console.log('get all', url, data)
          if (this.fetchAllOnce) {
            this.all = data.items;
          }
          if (data != null){
            this.all_meta = data._meta;
            return data.items;
          }
          return null;
        })
      )
    }

  }

  post<K = T>(model: K, id: number = undefined, getParams: string = ''): Observable<K> {
    console.log('posting', model, 'id: ', id)
    const headers = new HttpHeaders({ 'Content-Type':  'application/json' })
    return id == undefined ? 
      this.http.post<K>(
        this.config.apiUrl(`${this.recurso}?${getParams}`), 
        model,
        { headers }
      ) :
      this.http.put<K>(
        `${this.config.apiUrl(this.recurso)}/${id}?${getParams}`, 
        model,
        { headers }
      ) 
  }
  postFormData<K = T>(model: K, id: number = undefined, getParams: string = ''): Observable<K> {
    // const headers = new HttpHeaders({ 'Content-Type':  'application/json' })
    console.log(model);
    const f = new FormData()
    for ( let key in model ) {
      f.append(key, (model as any)[key])
    }
    // f.forEach(v => {
    //   console.log(v)
    // })
    console.log('posting form data', f, 'id: ', id)
    return id == undefined ? 
      this.http.post<K>(
        this.config.apiUrl(`${this.recurso}?${getParams}`), 
        f,
        // { headers }
      ) :
      this.http.put<K>(
        `${this.config.apiUrl(this.recurso)}/${id}?${getParams}`, 
        f,
        // { headers }
      ) 
  }

  delete(id: number): Observable<any> {
    return this.http.delete(
      `${this.config.apiUrl(this.recurso)}/${id}`
    )
  }

  put(model: any, id: number, recurso: string = null): Observable<any> {
    console.log('put', model, 'id: ', id)
    const headers = new HttpHeaders({ 'Content-Type':  'application/json' })
    return this.http.put(
      `${this.config.apiUrl(recurso ?? this.recurso)}/${id}`, 
      model,
      { headers }
    ) 
  }

}
