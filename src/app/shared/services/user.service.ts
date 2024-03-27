import { Injectable, computed, inject } from '@angular/core';
import { User } from '@shared/interfaces/user.interface';
import { StorageService } from './storage.service';
import { MockBackendService, updateDetails } from './mock-backend.service';
import { AuthService } from './auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor() {}
  storage = inject(StorageService);
  backend = inject(MockBackendService);
  auth = inject(AuthService);

  userDetails = toSignal(this.backend.user());

  setUserDetails(user: User) {
    return new Promise((resolve) => resolve(this.backend.setUser(user)));
  }

  private getUserDetails(email: string) {
    return new Promise<User | null>((resolve) => {
      const data = this.backend.getUser(email);

      if (data) resolve(data);
      else resolve(null);
    });
  }

  updateUserDetails(updates: updateDetails) {
    return new Promise((resolve, reject) => {
      let user = this.userDetails();
      if (user) {
        resolve(this.backend.updateUser(user.email, updates));
      } else reject(new Error('User details not available'));
    });
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
