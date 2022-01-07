import { TestBed } from '@angular/core/testing';

import { FotoclubService } from './fotoclub.service';

describe('FotoclubService', () => {
  let service: FotoclubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FotoclubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
