import { Injectable, inject } from '@angular/core';
import CryptoJS from 'crypto-js';
import { User } from '@shared/interfaces/user.interface';
import { StorageService } from './storage.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MockBackendService {
  storageService = inject(StorageService);

  USER_DOES_NOT_EXIST = 'User does not exist';
  PASSWORD_INCORRECT = 'Password is incorrect';

  private authSubject = new BehaviorSubject<Auth>({
    email: '',
    token: '',
    valid: false,
    loading: false,
  });

  auth() {
    return this.authSubject.asObservable();
  }

  createUser(email: string, password: string, user: User) {
    return new Promise<boolean>((resolve, reject) => {
      if (this.getToken(email)) {
        reject('User already exists');
        return;
      }
      try {
        const token = this.generateToken(email, password);
        const id = this.createIdHash(email);
        user = { ...user, id: id };
        this.storageService.writeToStorage(`${email}: auth`, token);
        this.storageService.writeToStorage(`${email}: details`, user);
      } catch (error) {
        reject(error);
      }
      resolve(true);
    });
  }

  deleteUser(email: string) {
    return new Promise<boolean>((resolve, reject) => {
      try {
        this.storageService.delete(`${email}: auth`);
        this.storageService.delete(`${email}: details`);
      } catch (error) {
        reject(error);
      }

      resolve(true);
    });
  }

  signIn(email: string, password: string) {
    let authToken: string | null = null;
    let finalAuth: string;
    return new Promise<boolean>(async (resolve, reject) => {
      this.authSubject.next({
        email: '',
        token: '',
        valid: false,
        loading: true,
      });
      const expectedResult = email + password;

      // Get the stored token, and reject if it isn't found
      let result = this.getToken(email);
      let decrypted: string = '';
      if (!result) reject(this.USER_DOES_NOT_EXIST);

      authToken = result;

      // Try to decrypt the token with the password, and reject if decryption is incorrect
      if (authToken && typeof authToken == 'string') {
        decrypted = this.decrypt(authToken, password);
        finalAuth = authToken;
      } else reject(this.USER_DOES_NOT_EXIST);

      if (decrypted != expectedResult) reject(this.PASSWORD_INCORRECT);

      // If no failures, set the session auth & email, update the auth observable stream, and resolve as true
      this.setAuth(finalAuth);
      this.setSessionEmail(email);
      await this.artificialLoadingDelayAuthNext({
        email: email,
        token: finalAuth,
        valid: true,
        loading: false,
      });
      resolve(true);
    });
  }

  signOut() {
    return new Promise(async (resolve, reject) => {
      try {
        this.authSubject.next({
          email: '',
          token: '',
          valid: false,
          loading: true,
        });
        this.removeAuth();
        this.removeSessionEmail();
        await this.artificialLoadingDelayAuthNext({
          email: '',
          token: '',
          valid: false,
          loading: false,
        });
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  changeEmail(oldEmail: string, newEmail: string, password: string) {
    let authToken: string | null = null;
    let finalAuth: string;

    return new Promise<string>(async (resolve, reject) => {
      const expectedResult = oldEmail + password;
      // Get the stored token, and reject if it isn't found
      let result = this.getToken(oldEmail);
      let decrypted: string = '';
      if (!result) {
        reject(this.USER_DOES_NOT_EXIST);
        return;
      }

      authToken = result;

      // Try to decrypt the token with the password, and reject if decryption is incorrect
      if (authToken && typeof authToken == 'string') {
        decrypted = this.decrypt(authToken, password);
        finalAuth = authToken;
      } else {
        reject(this.USER_DOES_NOT_EXIST);
        return;
      }

      if (decrypted != expectedResult) {
        reject(this.PASSWORD_INCORRECT);
        return;
      }

      // If no errors, go on to retrieve the auth details for updating
      let userDetails: User;
      try {
        userDetails = this.getUserDetails(oldEmail) as User;
      } catch (error) {
        reject(error);
        return;
      }

      // check that the new email is not one already in use
      if (this.getToken(newEmail)) {
        reject('Email already in use');
        return;
      }

      // If email is free, proceed to update the records, creating new ones and deleting the old ones

      let newId: string;

      try {
        const newToken = this.generateToken(newEmail, password);
        newId = this.createIdHash(newEmail);
        let newUserDetails = { ...userDetails, id: newId, email: newEmail };
        this.storageService.writeToStorage(`${newEmail}: auth`, newToken);
        this.storageService.writeToStorage(
          `${newEmail}: details`,
          newUserDetails
        );
        await this.deleteUser(oldEmail);
      } catch (error) {
        reject(error);
        return;
      }

      // Update auth details
      await this.signIn(newEmail, password);

      resolve(newId);
    });
  }

  private generateToken(email: string, password: string) {
    const data = email + password;
    const token = this.encrypt(data, password);
    return token;
  }

  private getToken(email: string) {
    return this.storageService.readFromStorage(`${email}: auth`);
  }

  private encrypt(str: string, key: string) {
    return CryptoJS.AES.encrypt(str, key).toString();
  }

  private createIdHash(email: string) {
    return CryptoJS.HmacSHA256(email, email).toString();
  }

  private decrypt(str: string, key: string) {
    return CryptoJS.AES.decrypt(str, key).toString(CryptoJS.enc.Utf8);
  }

  private setAuth(hash: string) {
    this.storageService.writeToStorage('sessionAuth', hash);
  }
  private getAuth() {
    return this.storageService.readFromStorage('sessionAuth') as string;
  }
  private getSessionEmail() {
    return this.storageService.readFromStorage('sessionEmail');
  }

  private removeAuth() {
    this.storageService.delete('sessionAuth');
  }

  private setSessionEmail(email: string) {
    this.storageService.writeToStorage('sessionEmail', email);
  }
  private removeSessionEmail() {
    this.storageService.delete('sessionEmail');
  }

  private getUserDetails(email: string) {
    return this.storageService.readFromStorage(`${email}: details`);
  }

  private artificialLoadingDelayAuthNext(auth: Auth) {
    const delay = Math.round(Math.random() * 1000 * (Math.random() * 5));
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.authSubject.next(auth));
      }, delay);
    });
  }
}

export interface Auth {
  email: string;
  token: string;
  valid: boolean;
  loading: boolean;
}
