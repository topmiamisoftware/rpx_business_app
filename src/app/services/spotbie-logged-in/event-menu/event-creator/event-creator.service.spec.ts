import { TestBed } from '@angular/core/testing';

import { EventCreatorService } from './event-creator.service';

describe('RewardCreatorService', () => {
  let service: EventCreatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventCreatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
