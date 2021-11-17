import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Contest, ContestExpanded } from '../models/contest.model';
import { ContestCategory, ContestCategoryExpanded } from '../models/contest_category.model';
import { ContestSection, ContestSectionExpanded } from '../models/contest_section.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

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
      max_img_section: 3
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
    const d = new Date(fecha);
    return d.toISOString();
  }
}
