import { TestBed } from '@angular/core/testing';

import { MetricAbmService } from './metric-abm.service';

describe('MetricAbmService', () => {
  let service: MetricAbmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetricAbmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
