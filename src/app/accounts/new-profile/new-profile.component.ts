// Angular Imports
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  FormsModule,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';

import { SnackbarService } from '@shared/services/snackbar.service';
import { UserService } from '@shared/services/user.service';

// Utility Imports
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MOBILE_REGEX_PATTERN } from '@shared/utilities/mobile.regex';
import { updateDetails } from '@shared/services/mock-backend.service';

// Component Imports
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';
import { map } from 'rxjs';

@Component({
  selector: 'app-new-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    ReactiveFormsModule,
    RouterModule,
    LoadingButtonComponent,
  ],
  providers: [
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } },
  ],
  templateUrl: './new-profile.component.html',
  styleUrl: './new-profile.component.scss',
})
export class NewProfileComponent {
  formBuilder = inject(FormBuilder);
  router = inject(Router);
  snackbar = inject(SnackbarService);
  userService = inject(UserService);
  breakpoint = inject(BreakpointObserver);
  windowObserver = this.breakpoint
    .observe('(min-width: 1280px)')
    .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));

  user = this.userService.userDetails;

  readonly defaultAvatar = 'https://api.dicebear.com/8.x/thumbs/svg?radius=50';
  readonly defaultBackground = 'https://random.imagecdn.app/500/150';
  readonly defaultAboutMe =
    "Welcome to the whimsical realm of my 'About Me.' Here, words mingle in delightful disarray, concocting a blend of essence and wit. Just a hint of humor, a sprinkle of introspection, and a dash of charm await.";

  linearSteps = false;
  loading = false;
  optionalStep = true;

  phoneSaved = false;
  aboutMeSaved = false;
  profilePictureSaved = false;
  profileCoverImageSaved = false;
  imageLoadError = false;

  readonly countries: { name: string; code: string }[] = [
    { name: 'Kenya', code: '254' },
    { name: 'Tanzania', code: '255' },
    { name: 'Uganda', code: '256' },
    { name: 'Rwanda', code: '250' },
    { name: 'Democratic Republic of Congo', code: '243' },
    { name: 'United States', code: '1' },
    { name: 'United Kingdom', code: '44' },
  ];

  phoneNumberForm = this.formBuilder.group({
    countryCode: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(3)],
    ],
    phoneNumber: [
      '',
      [Validators.required, Validators.pattern(MOBILE_REGEX_PATTERN)],
    ],
  });

  aboutMeForm = this.formBuilder.group({
    aboutMe: ['', [Validators.maxLength(300), Validators.minLength(50)]],
  });

  profilePictureForm = this.formBuilder.group({
    profilePicture: [this.defaultAvatar],
  });

  profileCoverImageForm = this.formBuilder.group({
    profileCoverImage: [''],
  });

  async submitPhone() {
    if (this.phoneNumberForm.invalid) return;

    const values = this.phoneNumberForm.value;
    const countryCode = values.countryCode;
    const phoneNumber = values.phoneNumber;

    if (phoneNumber && countryCode) {
      const updates: updateDetails = {
        phoneNumber: phoneNumber,
        countryCode: countryCode,
      };

      try {
        this.loading = true;

        await this.userService.updateUserDetails(updates);

        this.loading = false;
        this.phoneSaved = true;
      } catch (error) {
        let thrownError = error as Error;
        this.snackbar.openSnackBarNoAction(thrownError.message, 4000);
        this.loading = false;
      }
    }
  }

  async submitAboutMe() {
    if (this.aboutMeForm.invalid) return;

    const values = this.aboutMeForm.value;
    const aboutMe = values.aboutMe;

    if (aboutMe) {
      const updates: updateDetails = {
        aboutMe: aboutMe,
      };

      try {
        this.loading = true;
        await this.userService.updateUserDetails(updates);
        this.loading = false;
        this.aboutMeSaved = true;
      } catch (error) {
        let thrownError = error as Error;
        this.snackbar.openSnackBarNoAction(thrownError.message, 4000);
        this.loading = false;
      }
    }
  }

  async submitProfilePicture() {
    if (this.imageLoadError) return;

    const values = this.profilePictureForm.value;
    const profilePicture = values.profilePicture;

    if (profilePicture) {
      const updates: updateDetails = {
        profilePicture: profilePicture,
      };

      try {
        this.loading = true;
        await this.userService.updateUserDetails(updates);
        this.loading = false;
        this.profilePictureSaved = true;
      } catch (error) {
        let thrownError = error as Error;
        this.snackbar.openSnackBarNoAction(thrownError.message, 4000);
        this.loading = false;
      }
    }
  }

  async submitProfileCover() {
    if (this.imageLoadError) return;

    const values = this.profileCoverImageForm.value;
    const profileCoverImage = values.profileCoverImage;

    if (profileCoverImage) {
      const updates: updateDetails = {
        profileCoverImage: profileCoverImage,
      };

      try {
        this.loading = true;
        await this.userService.updateUserDetails(updates);
        this.loading = false;
        this.profileCoverImageSaved = true;
      } catch (error) {
        let thrownError = error as Error;
        this.snackbar.openSnackBarNoAction(thrownError.message, 4000);
        this.loading = false;
      }
    }
  }

  // TODO: Fix This
  imageLoadFail(choice: 'profilePicture' | 'ProfileCover') {
    if (choice == 'profilePicture') {
      this.profilePictureControl.setErrors({ pictureInvalid: true });
      this.profilePictureControl.markAsTouched();
      this.profilePictureControl.updateValueAndValidity();
    } else {
      this.profileCoverImageControl.setErrors({ pictureInvalid: true });
      this.profileCoverImageControl.markAsTouched();
      this.profileCoverImageControl.updateValueAndValidity();
    }
    this.imageLoadError = true;
  }
  imageLoadSucceed(choice: 'profilePicture' | 'ProfileCover') {
    if (choice == 'profilePicture') {
      if (
        this.profilePictureControl.hasError('pictureInvalid') &&
        this.profilePictureControl.errors
      ) {
        delete this.profilePictureControl.errors['pictureInvalid'];
        this.profilePictureControl.markAsTouched();
        this.profilePictureControl.updateValueAndValidity();
      }
    } else {
      if (
        this.profileCoverImageControl.hasError('pictureInvalid') &&
        this.profileCoverImageControl.errors
      ) {
        delete this.profileCoverImageControl.errors['pictureInvalid'];
        this.profileCoverImageControl.markAsTouched();
        this.profileCoverImageControl.updateValueAndValidity();
      }
    }

    this.imageLoadError = false;
  }
  // END TODO

  get countryCodeControl() {
    return this.phoneNumberForm.get('countryCode') as FormControl;
  }
  get phoneNumberControl() {
    return this.phoneNumberForm.get('phoneNumber') as FormControl;
  }
  get aboutMeControl() {
    return this.aboutMeForm.get('aboutMe') as FormControl;
  }
  get aboutMeText() {
    return this.aboutMeControl.value as string;
  }
  get profilePictureControl() {
    return this.profilePictureForm.get('profilePicture') as FormControl;
  }
  get profileCoverImageControl() {
    return this.profileCoverImageForm.get('profileCoverImage') as FormControl;
  }

  get phoneValid() {
    return this.phoneNumberForm.valid;
  }
  get aboutMeValid() {
    return this.aboutMeForm.valid;
  }
  get profilePictureValid() {
    return this.profilePictureForm.valid;
  }
  get profileCoverValid() {
    return this.profileCoverImageForm.valid;
  }

  getCountryCodeErrors() {
    if (
      this.countryCodeControl.hasError('minlength') ||
      this.countryCodeControl.hasError('maxlength')
    )
      return 'Invalid country code';
    return '';
  }
  getPhoneNumberErrors() {
    if (this.phoneNumberControl.hasError('pattern'))
      return 'Invalid phone number';
    return '';
  }
  getAboutMeErrors() {
    if (this.aboutMeControl.hasError('maxlength'))
      return 'The input description is too long';
    if (this.aboutMeControl.hasError('minlength'))
      return 'The input description is too short. Aim for 50 characters';

    let text = this.aboutMeControl.value as string;
    return '';
  }
  getProfilePictureErrors() {
    if (this.imageLoadError) return 'The selected Image is invalid';
    else return '';
  }
}
