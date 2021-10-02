import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSerializedResponse } from '../models/ApiResponse';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService<T> {

  
  constructor(
    private recurso: string,
    private  http: HttpClient,
    private config: ConfigService,
    private _template: T
  ) { }

  get template() {
    return {...this._template}
  }

  get(id: number): Observable<T> {
    console.log('get', this.recurso, id)
    return this.http.get<T>(
      this.config.apiUrl(`${this.recurso}/${id}`)
    )
  }

  // https://www.yiiframework.com/doc/guide/2.0/en/rest-response-formatting
  getAll(getParams: string = ''): Observable<T[]> {
    return this.http.get<ApiSerializedResponse<T>>(
      this.config.apiUrl(`${this.recurso}?${getParams}`)
    ).pipe(
      map((data) => {
        console.log('get all', this.recurso, data)
        return data.items
      })
    )


    // return this.fetch((url: string) => 
    //   this.http.get<ApiSerializedResponse<T>>(url)
    //   .pipe(
    //     map((data) => {
    //       console.log('get all', this.recurso, data)
    //       return data.items
    //     })
    //   )
    // )
  }

  post(model: T, id: number = undefined): Observable<T> {
    const headers = new HttpHeaders({ 'Content-Type':  'application/json' })
    return id == undefined ? 
      this.http.post<T>(
        this.config.apiUrl(this.recurso), 
        model,
        { headers }
      ) :
      this.http.put<T>(
        `${this.config.apiUrl(this.recurso)}/${id}`, 
        model,
        { headers }
      ) 
  }

  delete(id: number): Observable<any> {
    return this.http.delete(
      `${this.config.apiUrl(this.recurso)}/${id}`
    )
  }


  // ngOnDestroy() {
  //   console.log(`destroy ${this.recurso}Service`)
  //   this.unsubscribe$.next();
  //   this.unsubscribe$.complete();
  // }

  // // https://dev.to/re4388/use-rxjs-takeuntil-to-unsubscribe-1ffj
  // private readonly unsubscribe$: Subject<void> = new Subject();

  // private fetch(callback: CallableFunction, recurso: string = undefined) {
  //   console.log(`fetching api desde ${this.recurso}Service - ` , recurso)
  //   return callback(
  //     this.config.apiUrl(recurso ?? this.recurso)
  //   ).pipe(
  //     takeUntil(this.unsubscribe$)
  //   )
  // }

}
