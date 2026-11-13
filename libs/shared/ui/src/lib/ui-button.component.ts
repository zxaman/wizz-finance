import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { WizzIconComponent, WizzIconName } from './wizz-icon.component';

export type UiButtonVariant =
  | 'primary'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'dark'
  | 'danger'
  | 'danger-outline';

export type UiButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'wizz-button',
  standalone: true,
  imports: [WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [class]="classes()"
      [disabled]="disabled() || loading()"
      (click)="handleClick($event)"
    >
      @if (loading()) {
        <wizz-icon name="loader" [size]="iconSize()" [spin]="true" />
      } @else if (leadingIcon(); as icon) {
        <wizz-icon [name]="icon" [size]="iconSize()" />
      }
      <span class="btn-label"><ng-content /></span>
      @if (!loading() && trailingIcon(); as tIcon) {
        <wizz-icon [name]="tIcon" [size]="iconSize()" />
      }
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      :host(.w-full) {
        display: block;
        width: 100%;
      }
      .wizz-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-radius: var(--wizz-radius-pill);
        font-weight: 600;
        border: 1.5px solid transparent;
        cursor: pointer;
        transition: all 0.18s ease;
        white-space: nowrap;
        line-height: 1.2;
      }
      .wizz-btn--full {
        width: 100%;
      }
      .wizz-btn--sm {
        height: 36px;
        padding: 0 16px;
        font-size: 0.8125rem;
      }
      .wizz-btn--md {
        height: 44px;
        padding: 0 22px;
        font-size: 0.875rem;
      }
      .wizz-btn--lg {
        height: 48px;
        padding: 0 28px;
        font-size: 0.9375rem;
      }
      .wizz-btn--primary {
        background: var(--wizz-primary);
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(121, 101, 240, 0.24);
      }
      .wizz-btn--primary:hover:not(:disabled) {
        background: var(--wizz-primary-hover);
        transform: translateY(-1px);
      }
      .wizz-btn--primary:disabled {
        background: var(--wizz-primary-disabled);
        box-shadow: none;
        cursor: not-allowed;
      }
      .wizz-btn--outline {
        background: #ffffff;
        color: var(--wizz-primary);
        border-color: var(--wizz-primary-border);
      }
      .wizz-btn--outline:hover:not(:disabled) {
        background: var(--wizz-primary-soft);
        border-color: var(--wizz-primary);
      }
      .wizz-btn--secondary {
        background: var(--wizz-surface-muted);
        color: var(--wizz-text);
        border-color: var(--wizz-border);
      }
      .wizz-btn--secondary:hover:not(:disabled) {
        background: #eceef5;
      }
      .wizz-btn--dark {
        background: #14151a;
        color: #ffffff;
      }
      .wizz-btn--dark:hover:not(:disabled) {
        background: #272933;
      }
      .wizz-btn--ghost {
        background: transparent;
        color: var(--wizz-text-secondary);
      }
      .wizz-btn--ghost:hover:not(:disabled) {
        background: var(--wizz-surface-muted);
        color: var(--wizz-text);
      }
      .wizz-btn--danger {
        background: var(--wizz-danger);
        color: #ffffff;
      }
      .wizz-btn--danger-outline {
        background: #ffffff;
        color: var(--wizz-danger);
        border-color: #f6c2c0;
      }
      .wizz-btn--danger-outline:hover:not(:disabled) {
        background: var(--wizz-danger-soft);
        border-color: var(--wizz-danger);
      }
      .wizz-btn:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
    `,
  ],
  host: {
    '[class.w-full]': 'fullWidth()',
  },
})
export class UiButtonComponent {
  readonly variant = input<UiButtonVariant>('primary');
  readonly size = input<UiButtonSize>('md');
  readonly fullWidth = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly leadingIcon = input<WizzIconName | undefined>(undefined);
  readonly trailingIcon = input<WizzIconName | undefined>(undefined);

  readonly clicked = output<MouseEvent>();

  readonly iconSize = computed(() => (this.size() === 'sm' ? 15 : 17));

  readonly classes = computed(() =>
    [
      'wizz-btn',
      `wizz-btn--${this.variant()}`,
      `wizz-btn--${this.size()}`,
      this.fullWidth() ? 'wizz-btn--full' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  handleClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
