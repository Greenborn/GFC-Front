import { Injectable } from '@angular/core';
import { ContestSection } from '../models/contest_section.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ContestSectionService extends ApiService<ContestSection> {

  constructor(config: ConfigService) {
    super('contest-section', config)
   }

   get template(): ContestSection {
    return {
      id: undefined,
      contest_id: undefined,
      section_id: undefined
    }
  }
}
