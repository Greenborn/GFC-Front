import { Injectable } from '@angular/core';
import { Metric } from '../models/metric.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class MetricService extends ApiService<Metric> {

  constructor(config: ConfigService) {
    super('metric', config)
    this.unwrapResponse = 'data'
   }

   get template(): Metric {
    return {
      id: undefined,
      prize: undefined,
      score: undefined
    }
  }
}
