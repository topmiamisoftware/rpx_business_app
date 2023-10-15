import { TestBed } from '@angular/core/testing';

import { RewardCreatorService } from './reward-creator.service';

describe('RewardCreatorService', () => {
  let service: RewardCreatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RewardCreatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
