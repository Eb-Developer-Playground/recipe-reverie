import { TestBed } from '@angular/core/testing';

import { MockBackendService } from './mock-backend.service';
import { User } from 'shared/interfaces/user.interface';
import * as CryptoJS from 'crypto-js';

describe('MockBackendService', () => {
  let service: MockBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockBackendService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a user', async () => {
    const testUser: User = {
      name: 'Name',
      email: 'test@email.com',
      phoneNumber: '0720000000',
    };
    const testPassword = 'SecurePassword1.2.3';
    const expectedDecrypt = testUser.email + testPassword;

    await service.createUser(testUser.email, testPassword, testUser);
    const authToken = localStorage.getItem(`${testUser.email}: auth`);

    let decryptedString: string | null = null;
    if (authToken)
      decryptedString = CryptoJS.AES.decrypt(authToken, testPassword).toString(
        CryptoJS.enc.Utf8
      );
    const retreivedDetails = localStorage.getItem(`${testUser.email}: details`);
    let retreivedUser: User | null = null;
    if (retreivedDetails) retreivedUser = JSON.parse(retreivedDetails);

    expect(authToken).toBeDefined;
    expect(decryptedString).toEqual(expectedDecrypt);
    expect(retreivedUser).not.toBeNull();
    expect(retreivedUser?.email).toEqual(testUser.email);
  });

  it('should delete a user', async () => {
    const testUser: User = {
      name: 'Name',
      email: 'test@email.com',
      phoneNumber: '0720000000',
    };
    const testAuth = 'testAuth';

    localStorage.setItem(`${testUser.email}: auth`, testAuth);
    localStorage.setItem(
      `${testUser.email}: details`,
      JSON.stringify(testUser)
    );

    await service.deleteUser(testUser.email);

    const authDetails = localStorage.getItem(`${testUser.email}: auth`);
    const userDetails = localStorage.getItem(`${testUser.email}: details`);

    expect(authDetails).toBeNull();
    expect(userDetails).toBeNull();
  });

  it('should sign in a valid user', async () => {
    const testUser: User = {
      name: 'Name',
      email: 'test@email.com',
      phoneNumber: '0720000000',
    };
    const testPassword = 'SecurePassword1.2.3';
    const expectedDecrypt = testUser.email + testPassword;
    const token = CryptoJS.AES.encrypt(
      expectedDecrypt,
      testPassword
    ).toString();

    localStorage.setItem(`${testUser.email}: auth`, token);

    const signedIn = await service.signIn(testUser.email, testPassword);

    expect(signedIn).toBe(true);
  });
});
