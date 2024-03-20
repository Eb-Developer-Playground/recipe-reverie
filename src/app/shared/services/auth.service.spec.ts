import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  describe('Default behaviour', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have an auth state', () => {
      const auth = service.authState();

      expect(auth).toBeDefined();
    });

    it('should be invalid by default', () => {
      const auth = service.authState();

      expect(auth?.valid).toEqual(false);
      expect(auth?.email.length).toEqual(0);
      expect(auth?.token.length).toEqual(0);
    });
  });
});
