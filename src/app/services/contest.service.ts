import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Contest, ContestExpanded } from '../models/contest.model';
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
    super('contest', http, config, {
      id: undefined,
      name: undefined,
      description: undefined,
      start_date: undefined,
      end_date: undefined
    })
  }

  
  // getContestWithResults(id: number): Observable<ContestExpanded> {
  //   return super.get<ContestExpanded>(id, `expand=contestResults,contestResults.image.profile`)
  //   // return super.fetchAll<ContestExpanded>(`expand=image,metric&filter[contest_id]=${contestId}`)
  // }

  formatearFechaParaHTML(fecha: string): string {
    const d = new Date(parseInt(fecha));
    let anio = d.getFullYear().toString();
    let mes = (d.getMonth()+1).toString();
    if (mes.length == 1) mes = '0' + mes;
    let dia = d.getDate().toString();
    if (dia.length == 1) dia = '0' + dia;
    return `${anio}-${mes}-${dia}`;
  }
  
  formatearFechaParaBD(fecha: string): string {
    return Date.parse(fecha).toString();
  }
}
