import { Injectable } from '@angular/core';
import axios from 'axios';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

export interface ContestApprovalStatus {
  contest_id?: number;
  items?: { user_id: number; approved_at: string; user?: any }[];
  judges_count?: number;
  approved_count?: number;
  all_approved?: boolean;
  preseleccion_completa?: boolean;
  my_approved?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ContestApproveService extends ApiService<ContestApprovalStatus> {

  constructor(config: ConfigService) {
    super('contest-approve', config)
    this.customBaseUrl = config.data.nodeApiBaseUrl
    this.useAuthHeader = true
  }

  get template(): ContestApprovalStatus {
    return { contest_id: undefined }
  }

  async getStatus(contest_id: number): Promise<ContestApprovalStatus | null> {
    try {
      const url = `${this.getBaseUrl()}${this.getPath()}?contest_id=${contest_id}`;
      const res = await axios.get(url, { headers: this.getHeaders() });
      return res.data as ContestApprovalStatus;
    } catch (error) {
      console.error('Error al obtener estado de visto bueno', error);
      return null;
    }
  }

  async aprobar(contest_id: number): Promise<ContestApprovalStatus | null> {
    try {
      const url = `${this.getBaseUrl()}${this.getPath()}`;
      const res = await axios.post(url, { contest_id }, {
        headers: { ...this.getHeaders(), 'Content-Type': 'application/json' }
      });
      return res.data as ContestApprovalStatus;
    } catch (error) {
      console.error('Error al dar visto bueno', error);
      return null;
    }
  }
}
