import { TestBed } from '@angular/core/testing';

import { InfoCentroService } from './info-centro.service';

describe('InfoCentroService', () => {
  let service: InfoCentroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfoCentroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
