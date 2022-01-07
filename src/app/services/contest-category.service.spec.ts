import { TestBed } from '@angular/core/testing';

import { ContestCategoryService } from './contest-category.service';

describe('ContestCategoryService', () => {
  let service: ContestCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContestCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
