import { Injectable } from '@angular/core';
import { ContestJudge } from '../models/contest_judge.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContestJudgeService extends ApiService<ContestJudge> {

  constructor(config: ConfigService) {
    super('contest-judge', config)
    this.customBaseUrl = config.data.nodeApiBaseUrl
    this.unwrapResponse = 'items'
  }

  get template(): ContestJudge {
    return {
      id: undefined,
      contest_id: undefined,
      user_id: undefined,
    }
  }
}
