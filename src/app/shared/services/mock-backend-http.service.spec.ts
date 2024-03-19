import { TestBed } from '@angular/core/testing';

import { MockBackendHttpService } from './mock-backend-http.service';

describe('MockBackendHttpService', () => {
  let service: MockBackendHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockBackendHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
