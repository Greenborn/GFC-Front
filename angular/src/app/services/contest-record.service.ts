
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ContestRecord } from '../concursos/concurso-detail/contest-records/models/contest.record';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContestRecordService extends ApiService<ContestRecord> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('contest-record', http, config)
    // this.fetchAllOnce = true
   }

   get template(): ContestRecord {
    return {
        id:         undefined,
        url:        undefined,
        object:     undefined,
        contest_id: undefined,
    }
  }
}
