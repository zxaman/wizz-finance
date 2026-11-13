import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ThemeService } from '@wizz/design-tokens';

@Component({
  selector: 'wizz-brand-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="brand-logo" [class.brand-logo--light]="light()" [class.brand-logo--sm]="size() === 'sm'">
      <svg
        class="brand-mark"
        [attr.width]="markSize()"
        [attr.height]="markSize()"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <!-- Top-left green circle -->
        <circle cx="7.5" cy="7.5" r="5.5" [attr.fill]="theme.brand().colors.accentGreen" />
        <!-- Top-right & bottom-left connected purple rounded geometry -->
        <rect x="15" y="2" width="11" height="11" rx="3.5" [attr.fill]="theme.brand().colors.primary" />
        <rect x="2" y="15" width="11" height="11" rx="3.5" [attr.fill]="theme.brand().colors.primary" />
        <path d="M13 13H16V16H13V13Z" [attr.fill]="theme.brand().colors.primary" />
      </svg>
      @if (!markOnly()) {
        <span class="brand-wordmark">{{ customLabel() || theme.brandName() }}</span>
      }
    </span>
  `,
  styles: [
    `
      .brand-logo {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        user-select: none;
        font-weight: 700;
        font-size: 1.25rem;
        letter-spacing: -0.02em;
        color: var(--wizz-text);
      }
      .brand-logo--light {
        color: #ffffff;
      }
      .brand-logo--sm {
        font-size: 1.05rem;
        gap: 7px;
      }
      .brand-mark {
        flex-shrink: 0;
      }
    `,
  ],
})
export class BrandLogoComponent {
  protected readonly theme = inject(ThemeService);

  readonly light = input<boolean>(false);
  readonly markOnly = input<boolean>(false);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly customLabel = input<string>('');

  readonly markSize = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 22;
      case 'lg':
        return 32;
      default:
        return 26;
    }
  });
}
