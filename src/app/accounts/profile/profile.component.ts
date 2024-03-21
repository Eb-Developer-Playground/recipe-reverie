import { Component, inject } from '@angular/core';
import { AuthService } from '@shared/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  authService = inject(AuthService);
  authState = this.authService.authState;
}
