import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Metric } from '../models/metric.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class MetricAbmService extends ApiService<Metric> {
  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('metric-abm', http, config)
   }

   get template(): Metric {
    return {
      id: undefined,
      prize: undefined,
      score: undefined
    }
  }
}
