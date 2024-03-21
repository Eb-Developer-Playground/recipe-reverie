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
import { PasswordMatchValidator } from '@shared/utilities/password-match.validator';
import { User } from '@shared/interfaces/user.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltip,
    ReactiveFormsModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  formBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  registerForm = this.formBuilder.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(24),
        ],
      ],
      confirmPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(24),
        ],
      ],
    },
    {
      validators: [PasswordMatchValidator('password', 'confirmPassword')],
    }
  );

  async submit() {
    if (this.registerForm.invalid) return;

    const values = this.registerForm.value;
    const firstName = values.firstName;
    const lastName = values.lastName;
    const email = values.email;
    const password = values.password;

    if (firstName && lastName && email && password) {
      const user: User = {
        name: `${firstName} ${lastName}`,
        email: email,
      };
      await this.authService.signup(user, password);
      this.router.navigate(['/auth/login']);
    }
    // else // handle null values
  }

  get firstNameControl() {
    return this.registerForm.get('firstName') as FormControl;
  }
  get lastNameControl() {
    return this.registerForm.get('lastName') as FormControl;
  }
  get emailControl() {
    return this.registerForm.get('email') as FormControl;
  }
  get passwordControl() {
    return this.registerForm.get('password') as FormControl;
  }
  get confirmPasswordControl() {
    return this.registerForm.get('confirmPassword') as FormControl;
  }

  get formErrors() {
    return this.registerForm.errors;
  }

  get formValid() {
    return this.registerForm.valid;
  }

  getFirstNameErrors() {
    if (this.firstNameControl.hasError('required'))
      return 'You must enter your name';
    return null;
  }
  getLastNameErrors() {
    if (this.lastNameControl.hasError('required'))
      return 'You must enter your name';
    return null;
  }
  getEmailErrors() {
    if (this.emailControl.hasError('required'))
      return 'You must enter an email';
    if (this.emailControl.hasError('email')) return 'Enter a valid email';
    return null;
  }
  getPasswordErrors() {
    if (this.passwordControl.hasError('required'))
      return 'You must enter a passwprd';
    if (this.passwordControl.hasError('minlength'))
      return 'The input password is too short';
    if (this.passwordControl.hasError('maxlength'))
      return 'The input password is too long';
    if (this.passwordControl.hasError('passwordMismatch'))
      return 'Entered passwords do not match';

    return null;
  }
  getConfirmPasswordErrors() {
    if (this.confirmPasswordControl.hasError('required'))
      return 'You must enter a value';
    if (this.confirmPasswordControl.hasError('minlength'))
      return 'The input password is too short';
    if (this.confirmPasswordControl.hasError('maxlength'))
      return 'The input password is too long';
    if (this.confirmPasswordControl.hasError('passwordMismatch'))
      return 'Entered passwords do not match';
    return null;
  }
}
