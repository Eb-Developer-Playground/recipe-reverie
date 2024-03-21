import { Injectable, inject } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor() {}
  private snackbar = inject(MatSnackBar);

  openSnackbar(
    message: string,
    action?: string,
    duration: number = 3000,
    position: positionOptions = { vertical: 'bottom', horizontal: 'center' }
  ) {
    this.snackbar.open(message, action, {
      duration: duration,
      horizontalPosition: position.horizontal,
      verticalPosition: position.vertical,
    });
  }

  openSnackBarNoTimeout(
    message: string,
    action?: string,
    position: positionOptions = { vertical: 'bottom', horizontal: 'center' }
  ) {
    this.snackbar.open(message, action, {
      horizontalPosition: position.horizontal,
      verticalPosition: position.vertical,
    });
  }
  openSnackBarNoAction(
    message: string,
    duration: number = 2000,
    position: positionOptions = { vertical: 'bottom', horizontal: 'center' }
  ) {
    this.snackbar.open(message, undefined, {
      duration: duration,
      horizontalPosition: position.horizontal,
      verticalPosition: position.vertical,
    });
  }
}

interface positionOptions {
  vertical: 'top' | 'bottom';
  horizontal: 'start' | 'center' | 'end' | 'left' | 'right';
}
