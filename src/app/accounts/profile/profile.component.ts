import { Component, inject } from '@angular/core';
import { AuthService } from '@shared/services/auth.service';
import { UserService } from '@shared/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  userService = inject(UserService);
  user = this.userService.userDetails;
}
