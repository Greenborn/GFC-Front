import { TestBed } from '@angular/core/testing';

import { ConcursoService } from './concurso.service';

describe('ConcursoService', () => {
  let service: ConcursoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConcursoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
