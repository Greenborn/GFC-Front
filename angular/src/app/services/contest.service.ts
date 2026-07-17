import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import axios from 'axios';
import { Contest, ContestExpanded } from '../models/contest.model';
import { ContestCategory, ContestCategoryExpanded } from '../models/contest_category.model';
import { ContestSection, ContestSectionExpanded } from '../models/contest_section.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContestService extends ApiService<Contest> {

  constructor(config: ConfigService) {
    super('contest', config)
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

  getAll<K = Contest>(getParams = '', resource: string | null = null): Observable<K[]> {
    if (this.fetchAllOnce && this.all != undefined) {
      return new Observable<K[]>(subscriber => {
        subscriber.next(this.all as K[]);
      });
    }
    const url = this.config.publicApiUrl(`${resource ?? this.recurso}?${getParams}`)
    const token = localStorage.getItem(this.config.tokenKey);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;

    return from(axios.get(url, { headers }).then(r => {
      const data = r.data as any;
      if (this.fetchAllOnce) this.all = data?.items;
      if (data?._meta != null) this.all_meta = data._meta;
      return data?.items ?? data;
    }));
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

  formatearFechaParaHTML(fecha: string): string {
    if (fecha == null) return ''
    let cadena: string[] = fecha.split("-");
    let meses = ['','ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return `${cadena[2]}-${meses[parseInt(cadena[1])]}-${cadena[0]}`;
  }

  formatearFechaParaBD(fecha: string): string {
    let d = new Date(fecha);
    let s = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString();
    return s;
  }
}
