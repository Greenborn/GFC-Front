import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class RankingService extends ApiService<any> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('ranking', http, config)
    this.fetchAllOnce = true
   }

   get template(): any {
    return {
      "profiles": undefined,
      "fotoclubs": undefined
    }
  }
}