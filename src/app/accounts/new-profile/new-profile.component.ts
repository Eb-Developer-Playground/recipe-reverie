import { Component, inject } from '@angular/core';

import {
  FormsModule,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';

import { Router } from '@angular/router';

import { SnackbarService } from '@shared/services/snackbar.service';
import { updateDetails } from '@shared/services/mock-backend.service';
import { UserService } from '@shared/services/user.service';

@Component({
  selector: 'app-new-profile',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltip,
    ReactiveFormsModule,
  ],
  templateUrl: './new-profile.component.html',
  styleUrl: './new-profile.component.scss',
})
export class NewProfileComponent {
  formBuilder = inject(FormBuilder);
  router = inject(Router);
  snackbar = inject(SnackbarService);
  userService = inject(UserService);

  readonly MOBILE_PATTERN =
    /(\+\d{1,3}\s?)?((\(\d{3,4}\)\s?)|(\d{3,4})(\s|-?))(\d{3}(\s|-?))(\d{3})?/;

  readonly countries: { name: string; code: string }[] = [
    { name: 'Kenya', code: '254' },
    { name: 'Tanzania', code: '255' },
    { name: 'Uganda', code: '256' },
    { name: 'Rwanda', code: '250' },
    { name: 'Democratic Republic of Congo', code: '243' },
    { name: 'United States', code: '1' },
    { name: 'United Kingdom', code: '44' },
  ];

  detailsForm = this.formBuilder.group({
    countryCode: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(3)],
    ],
    phoneNumber: [
      '',
      [Validators.required, Validators.pattern(this.MOBILE_PATTERN)],
    ],
    aboutMe: ['', [Validators.maxLength(300), Validators.minLength(50)]],
    profilePicture: [''],
    profileCoverImage: [''],
  });

  async submit() {
    if (this.detailsForm.invalid) return;

    const values = this.detailsForm.value;
    const countryCode = values.countryCode;
    const phoneNumber = values.phoneNumber;
    const aboutMe = values.aboutMe;
    const profilePicture = values.profilePicture;
    const profileCoverImage = values.profileCoverImage;

    if (phoneNumber && countryCode) {
      const updates: updateDetails = {
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        aboutMe: aboutMe ? aboutMe : '',
        profilePicture: profilePicture ? profilePicture : '',
        profileCoverImage: profileCoverImage ? profileCoverImage : '',
      };

      try {
        await this.userService.updateUserDetails(updates);
      } catch (error) {
        let thrownError = error as Error;
        this.snackbar.openSnackBarNoAction(thrownError.message, 4000);
      }
    }
  }

  get countryCodeControl() {
    return this.detailsForm.get('countryCode') as FormControl;
  }
  get phoneNumberControl() {
    return this.detailsForm.get('phoneNumber') as FormControl;
  }
  get aboutMeControl() {
    return this.detailsForm.get('aboutMe') as FormControl;
  }
  get aboutMeText() {
    return this.aboutMeControl.value as string;
  }
  get profilePictureControl() {
    return this.detailsForm.get('profilePicture') as FormControl;
  }
  get profileCoverImageControl() {
    return this.detailsForm.get('profileCoverImage') as FormControl;
  }

  get formErrors() {
    return this.detailsForm.errors;
  }
  get formValid() {
    return this.detailsForm.valid;
  }

  getCountryCodeErrors() {
    if (
      this.countryCodeControl.hasError('minlength') ||
      this.countryCodeControl.hasError('maxlength')
    )
      return 'Invalid country code';
    return null;
  }
  getPhoneNumberErrors() {
    if (this.phoneNumberControl.hasError('pattern'))
      return 'Invalid phone number';
    return null;
  }
  getAboutMeErrors() {
    if (this.aboutMeControl.hasError('maxlength'))
      return 'The input description is too long';
    if (this.aboutMeControl.hasError('minlength'))
      return 'The input description is too short. Aim for 50 characters';

    let text = this.aboutMeControl.value as string;
    return null;
  }
}
