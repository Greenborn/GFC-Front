import { Injectable } from '@angular/core';
import { Contest } from '../models/contest.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class PublicContestService  extends ApiService<Contest> {

  constructor(config: ConfigService) {
    super('public-contest', config)
    this.apiPath = 'contest'
    this.useAuthHeader = true
   }

   get template(): Contest {
    return {
      id: undefined,
      name: undefined,
      description: undefined,
      start_date: undefined,
      end_date: undefined,
      max_img_section: 3
    }
  }
}
