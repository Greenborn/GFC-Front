import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends ApiService<Category> {

  constructor(config: ConfigService) {
    super('category', config)
    this.fetchAllOnce = true
   }

   get template(): Category {
    return {
      id: undefined,
      name: undefined
    }
  }
}
