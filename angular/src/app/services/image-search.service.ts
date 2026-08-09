import { Injectable } from '@angular/core';
import axios from 'axios';
import { ConfigService } from './config/config.service';

export interface ImageSearchParams {
  q?: string;
  search?: string;
  contest_id?: number;
  profile_id?: number;
  section_ids?: number[];
  category_ids?: number[];
  prizes?: string[];
  author?: string;
  code?: string;
  page?: number;
  perPage?: number;
  sort?: string;
  sort_dir?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageSearchService {

  constructor(
    private config: ConfigService,
  ) {}

  async search(attr: ImageSearchParams = {}): Promise<any> {
    let params = '';

    if (attr.search !== undefined && attr.search !== null && String(attr.search).trim() !== '') {
      params += '&search=' + encodeURIComponent(String(attr.search));
    } else if (attr.q !== undefined && attr.q !== null && String(attr.q).trim() !== '') {
      params += '&q=' + encodeURIComponent(String(attr.q));
    }

    params += (attr?.contest_id) ? '&filter[contest_id]=' + attr.contest_id : '';
    params += (attr?.profile_id) ? '&filter[profile_id]=' + attr.profile_id : '';
    params += (attr?.page) ? '&page=' + attr.page : '';
    params += (attr?.perPage) ? '&per-page=' + attr.perPage : '';
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

    const token = localStorage.getItem(this.config.tokenKey);
    const url = this.config.nodeApiBaseUrl + 'images/search?' + (params.startsWith('&') ? params.substring(1) : params);

    try {
      const res = await axios.get(url, {
        headers: {
          ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
          'Content-Type': 'application/json'
        }
      });
      return res?.data ?? null;
    } catch (error) {
      console.error('Error en búsqueda de imágenes:', error);
      return null;
    }
  }
}
