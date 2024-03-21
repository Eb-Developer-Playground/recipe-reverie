import { Component, inject } from '@angular/core';
import {
  FormsModule,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltip } from '@angular/material/tooltip';
import { AuthService } from '@shared/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { SnackbarService } from '@shared/services/snackbar.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltip,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  formBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  authState = this.authService.authState;
  router = inject(Router);
  snackbar = inject(SnackbarService);

  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [Validators.required, Validators.maxLength(30), Validators.minLength(8)],
    ],
  });

  async submit() {
    // If any validators aren't satisfied, return immediately
    if (this.loginForm.invalid) {
      this.snackbar.openSnackBarNoAction(
        'Please fill all the fields correctly',
        3000
      );
      return;
    }

    const values = this.loginForm.value;
    const email = values.email;
    const password = values.password;

    try {
      if (email && password) await this.authService.login(email, password);
      else throw new Error('Invalid Values');
      this.router.navigate(['/home']);
    } catch (error) {
      this.snackbar.openSnackBarNoAction(error as string);
      console.log(error);
    }
    // else // handle null values
  }

  get emailControl() {
    return this.loginForm.get('email') as FormControl;
  }
  get passwordControl() {
    return this.loginForm.get('password') as FormControl;
  }

  get formErrors() {
    return this.loginForm.errors;
  }

  get formValid() {
    return this.loginForm.valid;
  }

  getEmailErrors() {
    if (this.emailControl.hasError('required'))
      return 'You must enter an email';
    if (this.emailControl.hasError('email')) return 'Enter a valid email';
    return null;
  }

  getPasswordErrors() {
    if (this.passwordControl.hasError('required'))
      return 'You must enter a value';
    if (this.passwordControl.hasError('minlength'))
      return 'The input password is too short';
    if (this.passwordControl.hasError('maxlength'))
      return 'The input password is too long';
    return null;
  }
}
