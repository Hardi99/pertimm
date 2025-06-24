import { TestBed } from '@angular/core/testing';

import { PertimmApi } from './pertimm-api';

describe('PertimmApi', () => {
  let service: PertimmApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PertimmApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
