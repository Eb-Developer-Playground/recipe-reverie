import { Injectable, inject } from '@angular/core';
import { User } from '@shared/interfaces/user.interface';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor() {}
  storage = inject(StorageService);

  setUserDetails(user: User) {
    return new Promise((resolve) =>
      resolve(this.storage.writeToStorage(`${user.email}: User Details`, user))
    );
  }

  getUserDetails(email: string) {
    return new Promise<User | null>((resolve) => {
      const data = this.storage.readFromStorage(`${email}: User Details`);

      if (data) resolve(data as User);
      else resolve(null);
    });
  }

  updateUserDetails(user: User, updates: updateDetails) {
    let updatedUser: User = { ...user, ...updates };
    return new Promise((resolve) =>
      resolve(
        this.storage.writeToStorage(
          `${updatedUser.email}: User Details`,
          updatedUser
        )
      )
    );
  }

  changeEmail(oldEmail: string, newEmail: string, password: string) {
    return new Promise((resolve, reject) => {
      // try mock backend change email
    });
  }
}

interface updateDetails {
  name?: string;
  phoneNumber?: string;
  aboutMe?: string;
  profilePicture?: string;
  profileCoverImage?: string;
}
