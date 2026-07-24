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
    this.customBaseUrl = config.data.nodeApiBaseUrl
    this.useAuthHeader = true
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

  getCategoriasInscriptas(contest_id: number): Observable<ContestCategoryExpanded[]> {
    return super.getAll<ContestCategoryExpanded>(`filter[contest_id]=${contest_id}&expand=category`, 'contest-category')
  }
  getSeccionesInscriptas(contest_id: number): Observable<ContestSectionExpanded[]> {
    return super.getAll<ContestSectionExpanded>(`filter[contest_id]=${contest_id}&expand=section`, 'contest-section')
  }

  isActive(c: Contest): boolean {
    return new Date(c.end_date) > new Date()
  }

  setJudging(id: number): Observable<any> {
    const url = `${this.getBaseUrl()}${this.getPath()}/${id}/set-judging`;
    return from(axios.put(url, {}, { headers: this.getHeaders() }).then(r => r.data));
  }
}
