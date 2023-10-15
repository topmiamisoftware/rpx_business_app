import { TestBed } from '@angular/core/testing';

import { EventMenuServiceService } from './event-menu-service.service';

describe('BusinessMenuServiceService', () => {
  let service: EventMenuServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventMenuServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
