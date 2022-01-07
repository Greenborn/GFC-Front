import { TestBed } from '@angular/core/testing';

import { ContestResultService } from './contest-result.service';

describe('ContestResultService', () => {
  let service: ContestResultService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContestResultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
