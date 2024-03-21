import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatToolbarModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  authService = inject(AuthService);
  testAuth = computed(() => {
    console.log(this.auth());
    this.auth();
  });
  auth = this.authService.authState;

  profileImage = 'https://api.dicebear.com/8.x/thumbs/svg?radius=50';
  profileImage2 =
    'https://api.dicebear.com/8.x/adventurer/svg?backgroundType=gradientLinear,solid';
}
