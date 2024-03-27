import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from '@shared/interfaces/user.interface';
import { MockBackendService } from './mock-backend.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}
  backend = inject(MockBackendService);

  authState = toSignal(this.backend.auth());

  isAuthenticated = computed(() => {
    const state = this.authState()?.valid;
    console.log('Auth state:', state);
    console.log('Auth signal value:', this.authState());
    if (state) return state;
    return false;
  });

  async login(email: string, password: string) {
    try {
      await this.backend.signIn(email, password);
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    if (this.authState()?.valid == false)
      throw new Error('User is not signed in');

    try {
      await this.backend.signOut();
    } catch (error) {
      throw error;
    }
  }

  async signup(user: User, password: string) {
    try {
      await this.backend.createUser(user.email, password, user);
    } catch (error) {
      throw error;
    }
  }
}
