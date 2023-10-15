import { TestBed } from '@angular/core/testing';

import { SpotbiePaymentsService } from './spotbie-payments.service';

describe('SpotbiePaymentsService', () => {
  let service: SpotbiePaymentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotbiePaymentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
