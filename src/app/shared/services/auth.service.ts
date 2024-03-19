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
  constructor() {
    this.auth = {
      email: '',
      token: '',
      valid: false,
    };
    this.authSubject = new BehaviorSubject<Auth>(this.auth);
    this.authState = toSignal(this.authSubject.asObservable());
  }
  backend = inject(MockBackendService);

  authState: Signal<Auth | undefined>;
  private auth: Auth;
  private authSubject: BehaviorSubject<Auth>;

  async login(email: string, password: string) {
    try {
      await this.backend.signIn(email, password);
    } catch (error) {
      throw error;
    }
    return await this.getAuth();
  }

  async logout() {
    if (this.authState()?.valid == false)
      throw new Error('User is not signed in');

    try {
      await this.backend.signOut();
    } catch (error) {
      throw error;
    }

    return await this.getAuth();
  }

  async signup(user: User, password: string) {
    try {
      await this.backend.createUser(user.email, password, user);
    } catch (error) {
      throw error;
    }

    return await this.getAuth();
  }

  private async getAuth() {
    let authToken = await this.backend.auth();
    let email = await this.backend.getEmail();
    const valid = authToken && email ? true : false;

    if (authToken && email) {
      this.auth = {
        email: email,
        token: authToken,
        valid: valid,
      };
    }

    this.authSubject.next(this.auth);
  }
}

export interface Auth {
  email: string;
  token: string;
  valid: boolean;
}
