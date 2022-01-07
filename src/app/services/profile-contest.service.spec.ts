import { TestBed } from '@angular/core/testing';

import { ProfileContestService } from './profile-contest.service';

describe('ProfileContestService', () => {
  let service: ProfileContestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileContestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
