import { Injectable, inject } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { User } from 'shared/interfaces/user.interface';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable } from 'rxjs';

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
  });

  auth() {
    return this.authSubject.asObservable();
  }

  createUser(email: string, password: string, user: User) {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const token = this.generateToken(email, password);
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
    return new Promise<boolean>((resolve, reject) => {
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
      this.authSubject.next({
        email: email,
        token: finalAuth,
        valid: true,
      });
      resolve(true);
    });
  }

  signOut() {
    return new Promise((resolve, reject) => {
      try {
        this.authSubject.next({
          email: '',
          token: '',
          valid: false,
        });
        this.removeAuth();
        this.removeSessionEmail();
        resolve(true);
      } catch (error) {
        reject(error);
      }
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

  private decrypt(str: string, key: string) {
    return CryptoJS.AES.decrypt(str, key).toString(CryptoJS.enc.Utf8);
  }

  private setAuth(hash: string) {
    this.storageService.writeToStorage('sessionAuth', hash);
  }
  private getAuth() {
    return this.storageService.readFromStorage('sessionAuth') as string;
  }
  private removeAuth() {
    this.storageService.delete('sessionAuth');
  }

  private setSessionEmail(email: string) {
    this.storageService.writeToStorage('sessionEmail', email);
  }
  private getSessionEmail() {
    return this.storageService.readFromStorage('sessionEmail');
  }
  private removeSessionEmail() {
    this.storageService.delete('sessionEmail');
  }
}

export interface Auth {
  email: string;
  token: string;
  valid: boolean;
}
