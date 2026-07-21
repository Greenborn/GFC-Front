import { Injectable } from '@angular/core';
import { Stadistics } from '../models/stadistics.model';
import { ApiService } from './api.service';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class StadisticsService extends ApiService<Stadistics> {

  constructor(config: ConfigService) {
    super('stadistics', config)
  }

  get template(): Stadistics {
    return {
      id: undefined,
      concursos: undefined,
      fotografias: undefined,
      mencion: undefined,
      primer_puesto: undefined,
    }
  }
}
