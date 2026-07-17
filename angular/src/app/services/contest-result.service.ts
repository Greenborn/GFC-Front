import { Injectable } from '@angular/core';

import { ContestResult } from '../models/contest_result.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContestResultService extends ApiService<ContestResult> {

  constructor(config: ConfigService) {
    super('contest-result', config)
    this.unwrapResponse = 'data'
  }

   get template(): ContestResult {
    return {
      id: undefined,
      contest_id: undefined,
      image_id: undefined,
      metric_id: undefined,
      section_id: undefined
    }
  }
}
