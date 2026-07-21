import { Injectable } from '@angular/core';
import { ContestCategory } from '../models/contest_category.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContestCategoryService extends ApiService<ContestCategory> {

  constructor(config: ConfigService) {
    super('contest-category', config)
   }

   get template(): ContestCategory {
    return {
      id: undefined,
      contest_id: undefined,
      category_id: undefined
    }
  }
}
