import { TestBed } from '@angular/core/testing';

import { MockBackendService } from './mock-backend.service';
import { User } from '@shared/interfaces/user.interface';
import * as CryptoJS from 'crypto-js';
import { firstValueFrom } from 'rxjs';

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

  describe('createUser()', () => {
    it('should create a user', async () => {
      const testUser: User = {
        name: 'Name',
        email: 'test@email.com',
        id: 'testID',
        phoneNumber: '0720000000',
      };
      const testPassword = 'SecurePassword1.2.3';
      const expectedDecrypt = testUser.email + testPassword;

      await service.createUser(testUser.email, testPassword, testUser);
      const authToken = localStorage.getItem(`${testUser.email}: auth`);

      let decryptedString: string | null = null;
      if (authToken)
        decryptedString = CryptoJS.AES.decrypt(
          authToken,
          testPassword
        ).toString(CryptoJS.enc.Utf8);
      const retreivedDetails = localStorage.getItem(
        `${testUser.email}: details`
      );
      let retreivedUser: User | null = null;
      if (retreivedDetails) retreivedUser = JSON.parse(retreivedDetails);

      expect(authToken).toBeDefined;
      expect(decryptedString).toEqual(expectedDecrypt);
      expect(retreivedUser).not.toBeNull();
      expect(retreivedUser?.email).toEqual(testUser.email);
    });

    it('should not overwrite existing details', async () => {
      let errorMessage: string | undefined = undefined;
      const testAuth = 'Test Auth';
      const testUser: User = {
        name: 'Name',
        email: 'test@email.com',
        id: 'testID',
        phoneNumber: '0720000000',
      };
      const testPassword = 'SecurePassword1.2.3';

      localStorage.setItem(`${testUser.email}: auth`, testAuth);

      try {
        await service.createUser(testUser.email, testPassword, testUser);
      } catch (error) {
        errorMessage = error as string;
      }

      expect(errorMessage).toBeDefined();
      expect(errorMessage).toEqual('User already exists');
    });
  });

  describe('deleteUser()', () => {
    it('should delete a user', async () => {
      const testUser: User = {
        name: 'Name',
        email: 'test@email.com',
        id: 'testID',
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
  });

  describe('signIn()', () => {
    it('should sign in a valid user', async () => {
      const testUser: User = {
        name: 'Name',
        email: 'test@email.com',
        id: 'testID',
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

    it('should fail when the user does not exist', async () => {
      let thrownError: any;

      try {
        await service.signIn('test@email.com', 'SecurePassword1.2.3');
      } catch (error) {
        thrownError = error as string;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError).toContain('User does not exist');
    });

    it('should fail when the password is incorrect', async () => {
      let thrownError: any;
      const testUser: User = {
        name: 'Name',
        email: 'test@email.com',
        id: 'testID',
      };
      const testPassword = 'SecurePassword1.2.3';
      const expectedDecrypt = testUser.email + testPassword;
      const token = CryptoJS.AES.encrypt(
        expectedDecrypt,
        testPassword
      ).toString();

      localStorage.setItem(`${testUser.email}: auth`, token);

      try {
        await service.signIn(testUser.email, testPassword + '1');
      } catch (error) {
        thrownError = error as string;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError).toContain('Password is incorrect');
    });

    it('should set the auth token upon valid sign in', async () => {
      const testUser: User = {
        name: 'Name',
        email: 'test@email.com',
        id: 'testID',
      };
      const testPassword = 'SecurePassword1.2.3';
      const expectedDecrypt = testUser.email + testPassword;
      const token = CryptoJS.AES.encrypt(
        expectedDecrypt,
        testPassword
      ).toString();

      localStorage.setItem(`${testUser.email}: auth`, token);

      await service.signIn(testUser.email, testPassword);

      const sessionAuth = localStorage.getItem('sessionAuth');
      let validAuth = '';
      if (sessionAuth) validAuth = sessionAuth;

      expect(validAuth).toBeDefined();
      expect(validAuth).not.toBeNull();
      expect(validAuth).toEqual(token);
    });
  });

  describe('signOut()', () => {
    it('should sign the user out', async () => {
      const testToken = 'testToken';
      const testEmail = 'example@email.com';
      localStorage.setItem('sessionAuth', testToken);
      localStorage.setItem('sessionEmail', testEmail);

      await service.signOut();

      const sessionAuth = localStorage.getItem('sessionAuth');
      const sessionEmail = localStorage.getItem('sessionEmail');

      expect(sessionAuth).toBeNull();
      expect(sessionEmail).toBeNull();
    });
  });

  describe('changeEmail()', () => {
    it('should change the email successfully', async () => {
      let testUser: User = {
        name: 'Name',
        email: 'test@email.com',
        id: 'testID',
        phoneNumber: '0720000000',
      };
      const testPassword = 'SecurePassword1.2.3';
      const newEmail = 'email@test.com';
      const token = CryptoJS.AES.encrypt(
        testUser.email + testPassword,
        testPassword
      ).toString();
      const id = CryptoJS.HmacSHA256(testUser.email, testUser.email).toString();
      const expectedNewID = CryptoJS.HmacSHA256(newEmail, newEmail).toString();
      testUser = { ...testUser, id: id };

      localStorage.setItem(`${testUser.email}: auth`, token);
      localStorage.setItem(
        `${testUser.email}: details`,
        JSON.stringify(testUser)
      );

      const newID = await service.changeEmail(
        testUser.email,
        newEmail,
        testPassword
      );
      let newDetails: User = {
        name: '',
        email: '',
        id: '',
        phoneNumber: '',
      };
      let temp = localStorage.getItem(`${newEmail}: details`);
      if (temp) newDetails = JSON.parse(temp) as User;
      const oldDetails = localStorage.getItem(`${testUser.email}: details`);

      expect(newID).toEqual(expectedNewID);
      expect(newDetails.email).toEqual(newEmail);
      expect(oldDetails).toBeNull();
    });
  });

  describe('Auth()', () => {
    it('should return auth when signed in', async () => {
      const testUser: User = {
        name: 'Name',
        email: 'email@test.com',
        id: 'testID',
      };
      const testPass = 'SecurePass';

      await service.createUser(testUser.email, testPass, testUser);
      await service.signIn(testUser.email, testPass);

      const authState = await firstValueFrom(service.auth());

      expect(authState.email).toEqual(testUser.email);
      expect(authState.token).toBeDefined();
      expect(authState.valid).toEqual(true);
    });

    it('should return invalid auth when not signed in', (done) => {
      service.auth().subscribe((auth) => {
        expect(auth.email.length).toEqual(0);
        expect(auth.token.length).toEqual(0);
        expect(auth.valid).toEqual(false);
        done();
      });
    });
  });
});
