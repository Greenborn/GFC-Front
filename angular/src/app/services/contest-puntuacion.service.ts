import { Injectable } from '@angular/core';
import axios from 'axios';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';
import { Metric } from '../models/metric.model';

export interface PuntuacionVoteCount {
  metric_abm_id: number;
  metric_abm?: Metric | null;
  count: number;
}

export interface PuntuacionItem {
  image_id: number;
  votes: PuntuacionVoteCount[];
  total_votes: number;
  my_vote: number | null;
}

export interface PuntuacionStatus {
  contest_id?: number;
  items: PuntuacionItem[];
  metrics: Metric[];
  organization_type?: string | null;
  judged_count?: number;
  total_count?: number;
  all_judged?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ContestPuntuacionService extends ApiService<PuntuacionStatus> {

  constructor(config: ConfigService) {
    super('contest-puntuacion', config)
    this.customBaseUrl = config.data.nodeApiBaseUrl
    this.useAuthHeader = true
  }

  get template(): PuntuacionStatus {
    return { contest_id: undefined, items: [], metrics: [] }
  }

  async getStatus(contest_id: number): Promise<PuntuacionStatus | null> {
    try {
      const url = `${this.getBaseUrl()}${this.getPath()}?contest_id=${contest_id}`;
      const res = await axios.get(url, { headers: this.getHeaders() });
      return res.data as PuntuacionStatus;
    } catch (error) {
      console.error('Error al obtener estado de puntuación', error);
      return null;
    }
  }

  async votar(contest_id: number, image_id: number, metric_abm_id: number): Promise<PuntuacionStatus | null> {
    try {
      const url = `${this.getBaseUrl()}${this.getPath()}`;
      const res = await axios.post(url, { contest_id, image_id, metric_abm_id }, {
        headers: { ...this.getHeaders(), 'Content-Type': 'application/json' }
      });
      return res.data as PuntuacionStatus;
    } catch (error) {
      console.error('Error al votar métrica', error);
      return null;
    }
  }
}
