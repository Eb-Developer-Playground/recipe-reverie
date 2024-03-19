import { Injectable, inject } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { User } from 'shared/interfaces/user.interface';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class MockBackendService {
  storageService = inject(StorageService);

  auth() {}

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
    let result: string | null = null;
    return new Promise<boolean>((resolve, reject) => {
      try {
        authToken = this.getToken(email);
        if (!authToken) throw new Error('User does not exist');
      } catch (error) {
        reject(error);
      }

      try {
        const expectedResult = email + password;
        if (!authToken) throw new Error('User does not exist');
        result = this.decrypt(authToken, password);
        if (result != expectedResult) throw new Error('Password is incorrect');
      } catch (error) {
        reject(error);
      }

      resolve(true);
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
}
