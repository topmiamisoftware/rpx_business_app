import { TestBed } from '@angular/core/testing';

import { BusinessMenuServiceService } from './business-menu-service.service';

describe('BusinessMenuServiceService', () => {
  let service: BusinessMenuServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessMenuServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
