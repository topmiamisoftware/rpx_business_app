import { TestBed } from '@angular/core/testing';

import { InfoObjectServiceService } from './info-object-service.service';

describe('InfoObjectServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InfoObjectServiceService = TestBed.get(InfoObjectServiceService);
    expect(service).toBeTruthy();
  });
});
