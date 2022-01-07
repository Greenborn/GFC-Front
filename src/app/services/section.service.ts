import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Section } from '../models/section.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class SectionService extends ApiService<Section> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('section', http, config)
    // this.fetchAllOnce = true
   }

   get template(): Section {
    return {
      id: undefined,
      name: undefined,
      parent_id: null
    }
  }
}
