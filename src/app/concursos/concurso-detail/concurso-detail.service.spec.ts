import { TestBed } from '@angular/core/testing';

import { ConcursoDetailService } from './concurso-detail.service';

describe('ConcursoDetailService', () => {
  let service: ConcursoDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConcursoDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
