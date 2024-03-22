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

  afterEach(() => {
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
      const testAuth = 'Test Auth';
      const testUser: User = {
        name: 'Name',
        email: 'test@email.com',
        id: 'testID',
        phoneNumber: '0720000000',
      };
      const testPassword = 'SecurePassword1.2.3';

      localStorage.setItem(`${testUser.email}: auth`, testAuth);

      const testFn = async () =>
        await service.createUser(testUser.email, testPassword, testUser);

      return expect(testFn).rejects.toThrow(/User already exists/);
    });
  });

  describe('setUser()', () => {
    it('should set user data', () => {
      const testUser: User = {
        name: 'Name',
        email: 'test@email.com',
        id: 'testID',
        phoneNumber: '0720000000',
      };

      service.setUser(testUser);

      const retreivedDetails = localStorage.getItem(
        `${testUser.email}: details`
      );
      let retreivedUser: User | null = null;
      if (retreivedDetails) retreivedUser = JSON.parse(retreivedDetails);

      expect(retreivedUser).not.toBeNull();
      expect(retreivedUser?.email).toEqual(testUser.email);
      expect(retreivedUser?.id).toEqual(testUser.id);
    });
    it('should overwrite existing data', () => {
      const testUser: User = {
        name: 'Name',
        email: 'test@email.com',
        id: 'testID',
        phoneNumber: '0720000000',
      };
      const testUserUpdated: User = { ...testUser, id: testUser.email + '.ke' };

      localStorage.setItem(
        `${testUser.email}: details`,
        JSON.stringify(testUser)
      );

      service.setUser(testUserUpdated);

      const retreivedDetails = localStorage.getItem(
        `${testUser.email}: details`
      );
      let retreivedUser: User | null = null;
      if (retreivedDetails) retreivedUser = JSON.parse(retreivedDetails);

      expect(retreivedUser).not.toBeNull();
      expect(retreivedUser?.email).toEqual(testUser.email);
      expect(retreivedUser?.id).toEqual(testUserUpdated.id);
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

  describe('getUser()', () => {
    it('should retrieve user details', () => {
      const testUser: User = {
        name: 'Name',
        email: 'test@email.com',
        id: 'testID',
        phoneNumber: '0720000000',
      };

      localStorage.setItem(
        `${testUser.email}: details`,
        JSON.stringify(testUser)
      );

      const retrievedUser = service.getUser(testUser.email);

      expect(retrievedUser).not.toBeNull();
      expect(retrievedUser?.id).toEqual(testUser.id);
      expect(retrievedUser?.email).toEqual(testUser.email);
    });

    it('should return null when user data does not exist', () => {
      const retrievedUser = service.getUser('nothere');

      expect(retrievedUser).toBeNull();
    });
  });

  describe('updateUser()', () => {
    it('should update user details', () => {
      const testUser: User = {
        name: 'Name',
        email: 'test@email.com',
        id: 'testID',
        phoneNumber: '0720000000',
      };
      const testUserUpdated: User = {
        ...testUser,
        name: testUser.email + '.ke',
      };

      localStorage.setItem(
        `${testUser.email}: details`,
        JSON.stringify(testUser)
      );

      service.updateUser(testUser.email, testUserUpdated);

      const retreivedDetails = localStorage.getItem(
        `${testUser.email}: details`
      );
      let retreivedUser: User | null = null;
      if (retreivedDetails) retreivedUser = JSON.parse(retreivedDetails);

      expect(retreivedUser).not.toBeNull();
      expect(retreivedUser?.name).toEqual(testUserUpdated.name);
    });
    it('should not overwrite email', () => {
      const testUser: User = {
        name: 'Name',
        email: 'test@email.com',
        id: 'testID',
        phoneNumber: '0720000000',
      };
      const testUserUpdated: User = {
        ...testUser,
        email: testUser.email + '.ke',
      };

      localStorage.setItem(
        `${testUser.email}: details`,
        JSON.stringify(testUser)
      );

      service.updateUser(testUser.email, testUserUpdated);

      const retreivedDetails = localStorage.getItem(
        `${testUser.email}: details`
      );
      let retreivedUser: User | null = null;
      if (retreivedDetails) retreivedUser = JSON.parse(retreivedDetails);

      expect(retreivedUser).not.toBeNull();
      expect(retreivedUser?.email).toEqual(testUser.email);
    });
    it('should not overwrite id', () => {
      const testUser: User = {
        name: 'Name',
        email: 'test@email.com',
        id: 'testID',
        phoneNumber: '0720000000',
      };
      const testUserUpdated: User = { ...testUser, id: testUser.id + '.ke' };

      localStorage.setItem(
        `${testUser.email}: details`,
        JSON.stringify(testUser)
      );

      service.updateUser(testUser.email, testUserUpdated);

      const retreivedDetails = localStorage.getItem(
        `${testUser.email}: details`
      );
      let retreivedUser: User | null = null;
      if (retreivedDetails) retreivedUser = JSON.parse(retreivedDetails);

      expect(retreivedUser).not.toBeNull();
      expect(retreivedUser?.id).toEqual(testUser.id);
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
      const testFn = async () =>
        await service.signIn('test@email.com', 'SecurePassword1.2.3');

      return expect(testFn).rejects.toThrow(/User does not exist/);
    });

    it('should fail when the password is incorrect', async () => {
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

      const testFn = async () =>
        await service.signIn(testUser.email, testPassword + '1');

      return expect(testFn).rejects.toThrow(/Password is incorrect/);
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
    it('should delete the old details when email is changed', async () => {
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
      testUser = { ...testUser, id: id };

      localStorage.setItem(`${testUser.email}: auth`, token);
      localStorage.setItem(
        `${testUser.email}: details`,
        JSON.stringify(testUser)
      );

      await service.changeEmail(testUser.email, newEmail, testPassword);

      const oldDetails = localStorage.getItem(`${testUser.email}: details`);

      expect(oldDetails).toBeNull();
    });
    it('should update and return the user ID on email change', async () => {
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

      expect(newID).toEqual(expectedNewID);
    });
    it('should error when the provided password is incorrect', async () => {
      const testEmail = 'test@email.com';
      const correctPassword = 'SecurePassword1.2.3';
      const incorrectPassword = 'SecurePassword1.2';
      let errorMessage: string = '';

      const token = CryptoJS.AES.encrypt(
        testEmail + correctPassword,
        correctPassword
      ).toString();

      localStorage.setItem(`${testEmail}: auth`, token);

      const testFn = async () =>
        await service.changeEmail(
          testEmail,
          testEmail + '+',
          incorrectPassword
        );

      return expect(testFn).rejects.toThrow(/Password is incorrect/);
    });
    it('should error when the new email is already in use', async () => {
      const testUser: User = {
        name: 'Name',
        email: 'test@email.com',
        id: 'testID',
        phoneNumber: '0720000000',
      };
      const correctPassword = 'SecurePassword1.2.3';
      const newEmail = 'email@email.com';

      const token = CryptoJS.AES.encrypt(
        testUser.email + correctPassword,
        correctPassword
      ).toString();

      localStorage.setItem(`${testUser.email}: auth`, token);
      localStorage.setItem(
        `${testUser.email}: details`,
        JSON.stringify(testUser)
      );
      localStorage.setItem(`${newEmail}: auth`, token);

      const testFn = async () =>
        await service.changeEmail(testUser.email, newEmail, correctPassword);

      return expect(testFn).rejects.toThrow(/That email is already in use/);
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
