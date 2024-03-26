import { Component, computed, input } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './loading-button.component.html',
  styleUrl: './loading-button.component.scss',
})
export class LoadingButtonComponent {
  variant = input<'raised' | 'stroked' | 'flat'>();
  color = input<'primary' | 'accent' | 'warn'>();
  loadingColor = computed(() => {
    if (this.color() == 'accent') {
      return 'primary';
    }
    return 'accent';
  });
  contentText = input<string>();
  width = input<string>();
}
