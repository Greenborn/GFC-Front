import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Metric } from '../models/metric.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class MetricService extends ApiService<Metric> {

  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('metric', http, config, {
      id: undefined,
      prize: undefined,
      score: undefined
    })
   }
}
