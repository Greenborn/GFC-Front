import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ContestCategory } from '../models/contest_category.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContestCategoryService extends ApiService<ContestCategory> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('contest-category', http, config)
    // this.fetchAllOnce = true
   }

   get template(): ContestCategory {
    return {
      id: undefined,
      contest_id: undefined,
      category_id: undefined
    }
  }
}
