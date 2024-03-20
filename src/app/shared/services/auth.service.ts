import {
  Injectable,
  OnInit,
  Signal,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User } from 'shared/interfaces/user.interface';
import { MockBackendService } from './mock-backend.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}
  backend = inject(MockBackendService);

  authState = toSignal(this.backend.auth());

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
