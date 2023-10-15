import { TestBed } from '@angular/core/testing';

import { SpotbieMetaService } from './spotbie-meta.service';

describe('SpotbieMetaService', () => {
  let service: SpotbieMetaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotbieMetaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
