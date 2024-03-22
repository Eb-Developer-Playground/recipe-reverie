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

  readonly USER_DOES_NOT_EXIST = 'User does not exist';
  readonly USER_ALREADY_EXISTS = 'User already exists';
  readonly EMAIL_ALREADY_IN_USE = 'That email is already in use';
  readonly PASSWORD_INCORRECT = 'Password is incorrect';
  readonly TOKEN_DOES_NOT_EXIST = 'Token does not exist';

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
      if (this.emailInUse(email)) {
        reject(new Error(this.USER_ALREADY_EXISTS));
        return;
      }
      try {
        const token = this.generateToken(email, password);
        const id = this.createIdHash(email);
        user = { ...user, id: id };

        this.updateAuth(email, token);
        this.updateUserDetails(email, user);
      } catch (error) {
        reject(error);
        return;
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
        return;
      }

      resolve(true);
    });
  }

  signIn(email: string, password: string) {
    let finalAuth: string;
    return new Promise<boolean>(async (resolve, reject) => {
      this.authSubject.next({
        email: '',
        token: '',
        valid: false,
        loading: true,
      });

      let valid = false;

      try {
        valid = this.passwordIsCorrect(email, password);
      } catch (error) {
        reject(error);
        return;
      }

      if (!valid) {
        reject(new Error(this.PASSWORD_INCORRECT));
        return;
      }

      // If no failures, set the session auth & email, update the auth observable stream, and resolve as true
      try {
        this.setAuth(this.getTokenNoNull(email));
        this.setSessionEmail(email);
      } catch (error) {
        reject(error);
        return;
      }

      await this.artificialLoadingDelayAuthNext({
        email: email,
        token: this.getTokenNoNull(email),
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
    return new Promise<string>(async (resolve, reject) => {
      // Check for user existence, and that password is correct
      try {
        const valid = this.passwordIsCorrect(oldEmail, password);
        if (!valid) {
          reject(new Error(this.PASSWORD_INCORRECT));
          return;
        }
      } catch (error) {
        reject(error);
        return;
      }

      // check that the new email is not one already in use
      if (this.emailInUse(newEmail)) {
        reject(new Error(this.EMAIL_ALREADY_IN_USE));
        return;
      }

      // If no errors, go on to retrieve the auth details for updating
      let userDetails = this.getUserDetails(oldEmail);
      if (!userDetails) {
        reject(new Error(this.USER_DOES_NOT_EXIST));
        return;
      }

      // Proceed to update the records, creating new ones and deleting the old ones
      let newId: string;

      try {
        newId = await this.switchEmail(
          oldEmail,
          newEmail,
          password,
          userDetails
        );
      } catch (error) {
        reject(error);
        return;
      }

      // Update auth details
      this.signOut();
      await this.signIn(newEmail, password);

      resolve(newId);
      return;
    });
  }

  changePassword(email: string, currentPassword: string, newPassword: string) {
    return new Promise<boolean>(async (resolve, reject) => {
      // Validate password
      try {
        const valid = this.passwordIsCorrect(email, currentPassword);
        if (!valid) {
          reject(new Error(this.PASSWORD_INCORRECT));
          return;
        }
      } catch (error) {
        reject(error);
        return;
      }

      // Generate new auth token with the new password
      await this.switchPassword(email, newPassword);

      resolve(true);
    });
  }

  // Auth Testing Functions
  private passwordIsCorrect(email: string, password: string) {
    const expectedResult = email + password;
    let token = this.getToken(email);
    if (token) {
      let decrypted: string = '';
      decrypted = this.decrypt(token, password);
      return decrypted == expectedResult;
    } else throw new Error(this.USER_DOES_NOT_EXIST);
  }

  private emailInUse(email: string) {
    const emailAuth = this.getToken(email);
    if (!emailAuth) return false;
    else return true;
  }

  // Data updating functions
  private async switchEmail(
    oldEmail: string,
    newEmail: string,
    password: string,
    user: User
  ) {
    const newToken = this.generateToken(newEmail, password);

    let newId = this.createIdHash(newEmail);
    let newUserDetails = { ...user, id: newId, email: newEmail };

    this.updateAuth(newEmail, newToken);
    this.updateUserDetails(newEmail, newUserDetails);

    await this.deleteUser(oldEmail);
    return newId;
  }

  private async switchPassword(email: string, newPassword: string) {
    const newToken = this.generateToken(email, newPassword);

    this.updateAuth(email, newToken);

    await this.signOut();
    await this.signIn(email, newPassword);
  }

  // Hashing / Encryption functions
  private encrypt(str: string, key: string) {
    return CryptoJS.AES.encrypt(str, key).toString();
  }
  private decrypt(str: string, key: string) {
    return CryptoJS.AES.decrypt(str, key).toString(CryptoJS.enc.Utf8);
  }
  private createIdHash(email: string) {
    return CryptoJS.HmacSHA256(email, email).toString();
  }
  private generateToken(email: string, password: string) {
    const data = email + password;
    const token = this.encrypt(data, password);
    return token;
  }

  // CRUD
  private getToken(email: string): string | null {
    const token: string | null = this.storageService.readFromStorage(
      `${email}: auth`
    );
    if (token) return token;
    else return null;
  }
  private getTokenNoNull(email: string): string {
    const token: string | null = this.storageService.readFromStorage(
      `${email}: auth`
    );
    if (token) return token;
    else throw new Error(this.TOKEN_DOES_NOT_EXIST);
  }
  private updateAuth(email: string, token: string) {
    this.storageService.writeToStorage(`${email}: auth`, token);
  }
  private getSessionAuth() {
    const sessionToken: string | null =
      this.storageService.readFromStorage('sessionAuth');
    if (sessionToken) return sessionToken;
    else return null;
  }
  private getSessionEmail() {
    const sessionEmail: string | null =
      this.storageService.readFromStorage('sessionEmail');
    if (sessionEmail) return sessionEmail;
    else return null;
  }
  private setAuth(hash: string) {
    this.storageService.writeToStorage('sessionAuth', hash);
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
    const user: User | null = this.storageService.readFromStorage(
      `${email}: details`
    );
    if (user) return user;
    else return null;
  }
  private updateUserDetails(email: string, user: User) {
    this.storageService.writeToStorage(`${email}: details`, user);
  }

  // Helper function
  private artificialLoadingDelayAuthNext(auth: Auth) {
    const factor1: number = 0; // larger = longer delay. Recommend 200 - 1000
    const factor2: number = 0; // larger = significantly longer delay. Recommend 1 - 5
    const delay = Math.round(Math.random() * factor1 * Math.random() * factor2);
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
