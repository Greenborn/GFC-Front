import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contest, ContestExpanded } from '../models/contest.model';
import { ContestCategory, ContestCategoryExpanded } from '../models/contest_category.model';
import { ContestSection, ContestSectionExpanded } from '../models/contest_section.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';
import { ApiSerializedResponse } from '../models/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class ContestService extends ApiService<Contest> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) { 
    super('contest', http, config, )
  }

  get template(): Contest {
    return {
      id: undefined,
      name: undefined,
      description: undefined,
      start_date: undefined,
      end_date: undefined,
      max_img_section: 3,
      sub_title: ''
    }
  }

  // Sobrescribimos getAll para usar publicApiUrl en lugar de apiUrl
  getAll<K = Contest>(getParams: string = '', resource: string = null): Observable<K[]> {
    if (this.fetchAllOnce && this.all != undefined) {
      console.log('get all stored', this.all)
      return new Observable(suscriber => {
        suscriber.next(this.all as K[])
      })
    } else {
      const url = this.config.publicApiUrl(`${resource ?? this.recurso}?${getParams}`)
      
      // Obtener token del localStorage
      const token = localStorage.getItem(this.config.tokenKey);
      const headers = token ? new HttpHeaders({
        'Authorization': 'Bearer ' + token
      }) : new HttpHeaders();

      return this.http.get<ApiSerializedResponse<K>>(url, { headers }).pipe(
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

  getCategoriasInscriptas(contest_id: number): Observable<ContestCategoryExpanded[]> {
    return super.getAll<ContestCategoryExpanded>(`filter[contest_id]=${contest_id}&expand=category`, 'contest-category')
  }
  getSeccionesInscriptas(contest_id: number): Observable<ContestSectionExpanded[]> {
    return super.getAll<ContestSectionExpanded>(`filter[contest_id]=${contest_id}&expand=section`, 'contest-section')
  }

  isActive(c: Contest): boolean {
    return new Date(c.end_date) > new Date()
  }

  
  // getContestWithResults(id: number): Observable<ContestExpanded> {
  //   return super.get<ContestExpanded>(id, `expand=contestResults,contestResults.image.profile`)
  //   // return super.fetchAll<ContestExpanded>(`expand=image,metric&filter[contest_id]=${contestId}`)
  // }

  formatearFechaParaHTML(fecha: string): string {
    // console.log("lo que trae: " + fecha)
    if (fecha == null) return '' 
    let cadena:string[] = fecha.split("-");
    let meses = ['','ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return `${cadena[2]}-${meses[parseInt(cadena[1])]}-${cadena[0]}`;
  }

  formatearFechaParaBD(fecha: string): string {
    let d = new Date(fecha);
    let s = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString();
    return s;
  }
}
