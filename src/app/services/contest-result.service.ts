import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContestResult, ContestResultExpanded } from '../models/contest_result.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContestResultService extends ApiService<ContestResult> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('contest-result', http, config)
  }

  get template(): ContestResult {
    return {
      id: undefined,
      contest_id: undefined,
      image_id: undefined,
      metric_id: undefined
    }
  }
}
