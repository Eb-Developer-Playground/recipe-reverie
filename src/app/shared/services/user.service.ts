import { Injectable, inject } from '@angular/core';
import { User } from '@shared/interfaces/user.interface';
import { StorageService } from './storage.service';
import { MockBackendService, updateDetails } from './mock-backend.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor() {}
  storage = inject(StorageService);
  backend = inject(MockBackendService);

  setUserDetails(user: User) {
    return new Promise((resolve) => resolve(this.backend.setUser(user)));
  }

  getUserDetails(email: string) {
    return new Promise<User | null>((resolve) => {
      const data = this.backend.getUser(email);

      if (data) resolve(data);
      else resolve(null);
    });
  }

  updateUserDetails(user: User, updates: updateDetails) {
    let updatedUser: User = { ...user, ...updates };
    return new Promise((resolve) =>
      resolve(this.backend.updateUser(user.email, updates))
    );
  }

  changeEmail(oldEmail: string, newEmail: string, password: string) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.backend.changeEmail(oldEmail, newEmail, password);
      } catch (error) {
        reject(error);
        return;
      }
      resolve(true);
    });
  }
}
