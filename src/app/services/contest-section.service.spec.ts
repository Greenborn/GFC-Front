import { TestBed } from '@angular/core/testing';

import { ContestSectionService } from './contest-section.service';

describe('ContestSectionService', () => {
  let service: ContestSectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContestSectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
