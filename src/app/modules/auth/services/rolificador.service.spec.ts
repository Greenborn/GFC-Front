import { TestBed } from '@angular/core/testing';

import { RolificadorService } from './rolificador.service';

describe('RolificadorService', () => {
  let service: RolificadorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolificadorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
