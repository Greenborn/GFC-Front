import { Injectable } from '@angular/core';
import axios from 'axios';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';
import { ContestPreselectedPhoto } from '../models/contest-preselected-photo.model';

@Injectable({
  providedIn: 'root'
})
export class ContestPreselectedPhotoService extends ApiService<ContestPreselectedPhoto> {

  constructor(config: ConfigService) {
    super('contest-preselected-photo', config)
    this.customBaseUrl = config.data.nodeApiBaseUrl
    this.unwrapResponse = 'items'
  }

  get template(): ContestPreselectedPhoto {
    return {
      id: undefined,
      contest_id: undefined,
      image_id: undefined,
    }
  }

  async list(contest_id: number): Promise<ContestPreselectedPhoto[]> {
    try {
      const params = `contest_id=${contest_id}&expand=image`;
      const url = `${this.getBaseUrl()}${this.getPath()}?${params}`;
      const res = await axios.get(url, { headers: this.getHeaders() });
      const data = res.data as any;
      const items: ContestPreselectedPhoto[] = data?.items ?? data ?? [];
      return items.map(item => this.normalizeItem(item));
    } catch (error) {
      console.error('Error al listar fotos preseleccionadas', error);
      return [];
    }
  }

  async votar(contest_id: number, image_id: number, preselected: boolean): Promise<ContestPreselectedPhoto | null> {
    try {
      const url = `${this.getBaseUrl()}${this.getPath()}`;
      const res = await axios.post(url, { contest_id, image_id, preselected }, {
        headers: { ...this.getHeaders(), 'Content-Type': 'application/json' }
      });
      const data = res.data?.data ?? res.data;
      return this.normalizeItem(data, { contest_id, image_id });
    } catch (error) {
      console.error('Error al votar foto', error);
      return null;
    }
  }

  private normalizeItem(data: any, fallback: { contest_id?: number; image_id?: number } = {}): ContestPreselectedPhoto {
    let votes: number[] = [];
    if (Array.isArray(data?.votes)) {
      votes = data.votes;
    } else if (typeof data?.votes === 'string') {
      try {
        const parsed = JSON.parse(data.votes);
        votes = Array.isArray(parsed) ? parsed : [];
      } catch {
        votes = [];
      }
    }
    const myVote = data?.my_vote ?? null;
    return {
      id: data?.id,
      contest_id: data?.contest_id ?? fallback.contest_id,
      image_id: data?.image_id ?? fallback.image_id,
      preselected: data?.preselected === true || data?.preselected == 1,
      votes,
      vote_count: data?.vote_count ?? votes.length,
      accept_count: data?.accept_count,
      reject_count: data?.reject_count,
      my_vote: (myVote === 'aceptar' || myVote === 'rechazar') ? myVote : null,
      image: data?.image,
    };
  }
}
