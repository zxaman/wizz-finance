import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@wizz/design-tokens';
import { UiToastContainerComponent } from '@wizz/ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UiToastContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet />
    <wizz-toast-container />
  `,
})
export class AppComponent {
  // Eagerly initialize ThemeService so CSS custom properties sync reactively via Signals
  protected readonly theme = inject(ThemeService);
}
