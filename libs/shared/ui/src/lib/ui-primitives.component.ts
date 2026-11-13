import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { CardBrand } from '@wizz/utils';
import { WizzIconComponent, WizzIconName } from './wizz-icon.component';

export type BadgeTone =
  | 'verified'
  | 'pending'
  | 'primary'
  | 'danger'
  | 'neutral'
  | 'coming-soon';

@Component({
  selector: 'wizz-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge" [class]="'badge badge--' + tone()">
      <ng-content />
    </span>
  `,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 10px;
        border-radius: var(--wizz-radius-pill);
        font-size: 0.72rem;
        font-weight: 600;
        white-space: nowrap;
      }
      .badge--verified {
        background: var(--wizz-green-soft);
        color: var(--wizz-green-dark);
      }
      .badge--pending {
        background: var(--wizz-amber-soft);
        color: var(--wizz-amber-dark);
      }
      .badge--primary {
        background: var(--wizz-primary-soft);
        color: var(--wizz-primary);
      }
      .badge--coming-soon {
        background: #ede9fe;
        color: #6d28d9;
      }
      .badge--danger {
        background: var(--wizz-danger-soft);
        color: var(--wizz-danger);
      }
      .badge--neutral {
        background: var(--wizz-surface-subtle);
        color: var(--wizz-text-secondary);
      }
    `,
  ],
})
export class UiBadgeComponent {
  readonly tone = input<BadgeTone>('neutral');
}

export interface StepItem {
  readonly id: string;
  readonly label: string;
}

@Component({
  selector: 'wizz-stepper',
  standalone: true,
  imports: [WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stepper">
      @for (step of steps(); track step.id; let i = $index) {
        <div
          class="step-item"
          [class.step-item--done]="i < activeIndex()"
          [class.step-item--active]="i === activeIndex()"
        >
          <div class="step-node">
            @if (i < activeIndex()) {
              <wizz-icon name="check" [size]="13" [strokeWidth]="3" />
            } @else {
              <span class="step-dot"></span>
            }
          </div>
          <span class="step-label">{{ step.label }}</span>
        </div>
        @if (i < steps().length - 1) {
          <div class="step-line" [class.step-line--done]="i < activeIndex()"></div>
        }
      }
    </div>
  `,
  styles: [
    `
      .stepper {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 22px;
      }
      .step-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        min-width: 72px;
      }
      .step-node {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid var(--wizz-border-strong);
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        color: #ffffff;
        transition: all 0.2s ease;
      }
      .step-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: transparent;
      }
      .step-item--active .step-node {
        border-color: var(--wizz-primary);
      }
      .step-item--active .step-dot {
        background: var(--wizz-primary);
      }
      .step-item--done .step-node {
        background: var(--wizz-green);
        border-color: var(--wizz-green);
      }
      .step-label {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--wizz-text-muted);
      }
      .step-item--active .step-label,
      .step-item--done .step-label {
        color: var(--wizz-text);
        font-weight: 600;
      }
      .step-line {
        flex: 1;
        height: 2px;
        background: var(--wizz-border);
        margin-top: 11px;
      }
      .step-line--done {
        background: var(--wizz-green);
      }
    `,
  ],
})
export class UiStepperComponent {
  readonly steps = input.required<readonly StepItem[]>();
  readonly activeIndex = input<number>(0);
}

@Component({
  selector: 'wizz-accordion',
  standalone: true,
  imports: [WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="acc-box" [class.acc-box--open]="expanded()">
      <button type="button" class="acc-head" (click)="expanded.update(v => !v)">
        <span class="acc-title">{{ title() }}</span>
        <wizz-icon [name]="expanded() ? 'chevron-up' : 'chevron-down'" [size]="16" />
      </button>
      @if (expanded()) {
        <div class="acc-content">
          <ng-content />
        </div>
      }
    </div>
  `,
  styles: [
    `
      .acc-box {
        border: 1px solid var(--wizz-border);
        border-radius: 12px;
        background: #ffffff;
        overflow: hidden;
      }
      .acc-head {
        width: 100%;
        padding: 13px 16px;
        background: var(--wizz-surface-muted);
        border: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        font-size: 0.73rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--wizz-text-secondary);
      }
      .acc-content {
        padding: 16px;
        border-top: 1px solid var(--wizz-border);
      }
    `,
  ],
})
export class UiAccordionComponent {
  readonly title = input.required<string>();
  readonly expanded = model<boolean>(false);
}

export interface TabOption {
  readonly id: string;
  readonly label: string;
  readonly badge?: string | number;
}

@Component({
  selector: 'wizz-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tabs-bar" role="tablist">
      @for (tab of tabs(); track tab.id) {
        <button
          type="button"
          role="tab"
          class="tab-pill"
          [class.tab-pill--active]="activeTab() === tab.id"
          (click)="activeTab.set(tab.id)"
        >
          {{ tab.label }}
          @if (tab.badge !== undefined) {
            <span class="tab-count">({{ tab.badge }})</span>
          }
        </button>
      }
    </div>
  `,
  styles: [
    `
      .tabs-bar {
        display: inline-flex;
        background: var(--wizz-surface-muted);
        padding: 4px;
        border-radius: 10px;
        border: 1px solid var(--wizz-border);
        gap: 4px;
      }
      .tab-pill {
        border: none;
        background: transparent;
        padding: 7px 22px;
        border-radius: 7px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--wizz-text-secondary);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .tab-pill--active {
        background: #ffffff;
        color: var(--wizz-text);
        box-shadow: var(--wizz-shadow-xs);
      }
      .tab-count {
        margin-left: 3px;
        opacity: 0.75;
      }
    `,
  ],
})
export class UiTabsComponent {
  readonly tabs = input.required<readonly TabOption[]>();
  readonly activeTab = model.required<string>();
}

@Component({
  selector: 'wizz-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="toggle-row">
      <span class="toggle-label">{{ label() }}</span>
      <button
        type="button"
        role="switch"
        class="switch-track"
        [class.switch-track--on]="checked()"
        [attr.aria-checked]="checked()"
        (click)="checked.update(v => !v)"
      >
        <span class="switch-thumb"></span>
      </button>
    </label>
  `,
  styles: [
    `
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        cursor: pointer;
      }
      .toggle-label {
        font-size: 0.84rem;
        font-weight: 600;
        color: var(--wizz-text);
      }
      .switch-track {
        width: 42px;
        height: 24px;
        border-radius: 999px;
        background: #d2d6e3;
        border: none;
        padding: 2px;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: background 0.18s ease;
      }
      .switch-track--on {
        background: var(--wizz-primary);
      }
      .switch-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        transition: transform 0.18s ease;
      }
      .switch-track--on .switch-thumb {
        transform: translateX(18px);
      }
    `,
  ],
})
export class UiToggleComponent {
  readonly label = input<string>('');
  readonly checked = model<boolean>(true);
}

@Component({
  selector: 'wizz-empty-state',
  standalone: true,
  imports: [WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-box">
      <div class="empty-illust">
        <wizz-icon [name]="icon()" [size]="34" />
      </div>
      <h3 class="empty-title">{{ title() }}</h3>
      @if (description()) {
        <p class="empty-desc">{{ description() }}</p>
      }
      <div class="empty-actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: [
    `
      .empty-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 48px 20px;
      }
      .empty-illust {
        width: 78px;
        height: 78px;
        border-radius: 22px;
        background: linear-gradient(145deg, #f3f4f8 0%, #e9ebf3 100%);
        color: #8b90a0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }
      .empty-title {
        margin: 0 0 6px;
        font-size: 1rem;
        font-weight: 700;
        color: var(--wizz-text);
      }
      .empty-desc {
        margin: 0 0 18px;
        max-width: 300px;
        font-size: 0.82rem;
        line-height: 1.5;
        color: var(--wizz-text-secondary);
      }
    `,
  ],
})
export class UiEmptyStateComponent {
  readonly icon = input<WizzIconName>('users');
  readonly title = input.required<string>();
  readonly description = input<string>('');
}

@Component({
  selector: 'wizz-payment-card-visual',
  standalone: true,
  imports: [UiBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="card-visual"
      [class]="'card-visual card-visual--' + themeVariant()"
      [class.card-visual--compact]="compact()"
      (click)="selected.emit()"
    >
      <div class="card-top">
        <div class="issuer-group">
          <span class="issuer-name">{{ issuer() }}</span>
          @if (isPrimary()) {
            <span class="primary-pill">• Primary</span>
          }
        </div>
        <div class="brand-logo">
          @if (brand() === 'mastercard') {
            <span class="mc-circles">
              <i class="mc-red"></i>
              <i class="mc-orange"></i>
            </span>
          } @else {
            <span class="visa-text">VISA</span>
          }
        </div>
      </div>

      <div class="card-number">
        <span>••••</span>
        <span>••••</span>
        <span>••••</span>
        <strong>{{ last4() }}</strong>
      </div>

      <div class="card-bottom">
        <span class="expiry">{{ expiry() }}</span>
        @if (!compact()) {
          <wizz-badge [tone]="verified() ? 'verified' : 'pending'">
            {{ verified() ? 'Verified' : 'Verification Pending' }}
          </wizz-badge>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .card-visual {
        border-radius: 16px;
        padding: 18px 20px;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 158px;
        cursor: pointer;
        transition: transform 0.18s ease, box-shadow 0.18s ease;
        box-shadow: 0 8px 24px rgba(15, 18, 30, 0.18);
      }
      .card-visual:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 30px rgba(15, 18, 30, 0.25);
      }
      .card-visual--compact {
        min-height: 112px;
        padding: 14px 16px;
      }
      .card-visual--charcoal {
        background: radial-gradient(circle at 80% 20%, #343741 0%, #16181f 75%);
      }
      .card-visual--navy {
        background: linear-gradient(135deg, #2b3860 0%, #1c2440 100%);
      }
      .card-visual--royal {
        background: linear-gradient(135deg, #1b3280 0%, #111f54 100%);
      }
      .card-visual--slate {
        background: linear-gradient(135deg, #3c3a5c 0%, #232138 100%);
      }
      .card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .issuer-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .issuer-name {
        font-weight: 700;
        font-size: 0.9rem;
        letter-spacing: 0.01em;
      }
      .primary-pill {
        background: rgba(255, 255, 255, 0.16);
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 0.68rem;
        font-weight: 600;
      }
      .visa-text {
        font-style: italic;
        font-weight: 800;
        font-size: 1.05rem;
        letter-spacing: 0.04em;
      }
      .mc-circles {
        display: inline-flex;
        align-items: center;
      }
      .mc-red,
      .mc-orange {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: inline-block;
      }
      .mc-red {
        background: #eb001b;
      }
      .mc-orange {
        background: #f79e1b;
        margin-left: -7px;
        opacity: 0.92;
      }
      .card-number {
        display: flex;
        align-items: center;
        gap: 14px;
        font-size: 0.95rem;
        letter-spacing: 0.08em;
        margin: 18px 0 14px;
        opacity: 0.94;
      }
      .card-visual--compact .card-number {
        margin: 10px 0 8px;
        font-size: 0.82rem;
      }
      .card-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.78rem;
        opacity: 0.92;
      }
    `,
  ],
})
export class UiPaymentCardVisualComponent {
  readonly issuer = input.required<string>();
  readonly last4 = input.required<string>();
  readonly expiry = input.required<string>();
  readonly brand = input<CardBrand>('mastercard');
  readonly verified = input<boolean>(true);
  readonly isPrimary = input<boolean>(false);
  readonly compact = input<boolean>(false);
  readonly themeVariant = input<'charcoal' | 'navy' | 'royal' | 'slate'>('charcoal');

  readonly selected = output<void>();
}

export interface ToastItem {
  readonly id: number;
  readonly message: string;
  readonly tone: 'success' | 'warning' | 'danger' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<readonly ToastItem[]>([]);

  show(message: string, tone: ToastItem['tone'] = 'success', durationMs = 3800): void {
    const id = ++this.nextId;
    this.toasts.update((list) => [...list, { id, message, tone }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}

@Component({
  selector: 'wizz-toast-container',
  standalone: true,
  imports: [WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [class]="'toast-item toast-item--' + toast.tone">
          <span class="toast-icon">
            @switch (toast.tone) {
              @case ('success') {
                <wizz-icon name="check-circle" [size]="18" />
              }
              @case ('danger') {
                <wizz-icon name="alert-circle" [size]="18" />
              }
              @default {
                <wizz-icon name="alert-triangle" [size]="18" />
              }
            }
          </span>
          <span class="toast-msg">{{ toast.message }}</span>
          <button
            type="button"
            class="toast-close"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Dismiss notification"
          >
            <wizz-icon name="x" [size]="15" />
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-stack {
        position: fixed;
        top: 74px;
        right: 24px;
        z-index: 1200;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 380px;
      }
      .toast-item {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #ffffff;
        border: 1px solid var(--wizz-border);
        border-bottom: 3px solid var(--wizz-primary);
        border-radius: 12px;
        padding: 12px 14px;
        box-shadow: var(--wizz-shadow-md);
        font-size: 0.84rem;
        font-weight: 600;
        color: var(--wizz-text);
        animation: slideToast 0.2s ease-out;
      }
      .toast-item--success .toast-icon {
        color: var(--wizz-green);
      }
      .toast-item--warning .toast-icon {
        color: var(--wizz-amber);
      }
      .toast-item--danger .toast-icon {
        color: var(--wizz-danger);
      }
      .toast-msg {
        flex: 1;
      }
      .toast-close {
        background: none;
        border: none;
        padding: 2px;
        cursor: pointer;
        color: var(--wizz-text-muted);
        display: inline-flex;
      }
      @media (max-width: 767px) {
        .toast-stack {
          left: 16px;
          right: 16px;
          top: 64px;
          max-width: none;
        }
      }
      @keyframes slideToast {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class UiToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}
