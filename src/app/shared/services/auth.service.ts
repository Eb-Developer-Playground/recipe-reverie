import { Injectable, OnInit, WritableSignal, signal } from '@angular/core';
import { of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from 'shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  authState = toSignal(this.getAuth());

  private getAuth() {
    let auth: Auth = {
      email: '',
      token: '',
      valid: false,
    };

    return of(auth);
  }

  login(email: string, password: string) {}

  logout() {}

  signup(user: User, password: string) {}
}

export interface Auth {
  email: string;
  token: string;
  valid: boolean;
}
