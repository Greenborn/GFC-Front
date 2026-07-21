import { Injectable } from '@angular/core';
import axios from "axios"
import { BehaviorSubject, Observable } from 'rxjs';
import { LoadingService } from './ui/loading.service';
import { ConfigService } from './config/config.service';

export interface GetContestResultsParams {
  contest_id: number;
  page?: number;
  perPage?: number;
  concursante_id?: number;
  search?: string;
  sort?: string;
  sort_dir?: string;
  author?: string;
  code?: string;
  section_ids?: number[];
  category_ids?: number[];
  prizes?: string[];
  present_loading?: boolean;
  skipPublish?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ContestResultsService {

  private resultData: any = null;
  readonly resultadosConcursoGeted = new BehaviorSubject<any>({ items: [] });

  get resultados$(): Observable<any> {
    return this.resultadosConcursoGeted.asObservable();
  }

  constructor(
    private loadingService: LoadingService,
    private config: ConfigService,
  ) {}

  async get_all(attr: GetContestResultsParams, reload = true) {
    if (!reload && this.resultData !== null)
      return this.resultData;

    try {
      if (!attr?.contest_id)
        return null;

      let params = '';
      params += 'expand=profile,profile.user,profile.fotoclub,image.profile,image.thumbnail';
      params += '&filter[contest_id]=' + attr.contest_id;
      params += (attr?.page) ? '&page=' + attr.page : '';
      params += (attr?.perPage) ? '&per-page=' + attr.perPage : '';
      params += (attr?.concursante_id) ? ('&filter[profile_id]=' + attr.concursante_id) : '';
      params += (attr?.search) ? '&search=' + encodeURIComponent(attr.search) : '';
      params += (attr?.sort) ? '&sort=' + attr.sort : '';
      params += (attr?.sort_dir) ? '&sort_dir=' + attr.sort_dir : '';
      params += (attr?.author) ? '&filter[author]=' + encodeURIComponent(attr.author) : '';
      params += (attr?.code) ? '&filter[code]=' + encodeURIComponent(attr.code) : '';
      if (attr?.section_ids?.length) {
        attr.section_ids.forEach(id => {
          params += '&filter[section_id]=' + id;
        });
      }
      if (attr?.category_ids?.length) {
        attr.category_ids.forEach(id => {
          params += '&filter[category_id]=' + id;
        });
      }
      if (attr?.prizes?.length) {
        attr.prizes.forEach(p => {
          params += '&filter[prize]=' + encodeURIComponent(p);
        });
      }

      if (attr?.present_loading)
        await this.loadingService.present('Cargando Resultados');

      const uniqueId = localStorage.getItem('sso_client_unique_id');
      if (uniqueId) {
        params += '&unique_id=' + encodeURIComponent(uniqueId);
      }

      const token = localStorage.getItem(this.config.tokenKey);
      const res = await axios.get(this.config.nodeApiBaseUrl + 'contest-result?' + params, {
        headers: {
          ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
          'Content-Type': 'application/json'
        }
      });

      if (res?.data) {
        if (attr?.present_loading)
          this.loadingService.dismiss();
        this.resultData = res.data;
        if (!attr?.skipPublish)
          this.resultadosConcursoGeted.next(this.resultData);
        return this.resultData;
      } else {
        if (attr?.present_loading)
          this.loadingService.dismiss();
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}


