import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { ThemeService } from '@wizz/design-tokens';
import { WizzIconComponent } from './wizz-icon.component';

export type ModalTone = 'none' | 'warning' | 'success' | 'danger' | 'info';

@Component({
  selector: 'wizz-modal',
  standalone: true,
  imports: [WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="modal-backdrop" (click)="onBackdropClick()">
        <div
          class="modal-card"
          [style.maxWidth.px]="maxWidth()"
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
        >
          @if (closable()) {
            <button
              type="button"
              class="modal-close"
              (click)="closed.emit()"
              aria-label="Close dialog"
            >
              <wizz-icon name="x-circle" [size]="20" />
            </button>
          }

          @if (tone() !== 'none') {
            <div class="tone-badge" [class]="'tone-badge tone-badge--' + tone()">
              @switch (tone()) {
                @case ('warning') {
                  <wizz-icon name="alert-triangle" [size]="26" />
                }
                @case ('success') {
                  <wizz-icon name="check-circle" [size]="26" />
                }
                @case ('danger') {
                  <wizz-icon name="alert-circle" [size]="26" />
                }
                @default {
                  <wizz-icon name="info" [size]="26" />
                }
              }
            </div>
          }

          @if (title()) {
            <h3 class="modal-title" [class.modal-title--left]="align() === 'left'">
              {{ title() }}
            </h3>
          }
          @if (subtitle()) {
            <p class="modal-subtitle" [class.modal-subtitle--left]="align() === 'left'">
              {{ subtitle() }}
            </p>
          }

          <div class="modal-body">
            <ng-content />
          </div>

          @if (showSupportFooter()) {
            <div class="support-footer">
              <span>Please contact support if you have an issue</span>
              <strong>{{ theme.brand().supportEmail }} | {{ theme.brand().supportPhone }}</strong>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: rgba(14, 14, 20, 0.56);
        backdrop-filter: blur(2px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: fadeIn 0.16s ease-out;
      }
      .modal-card {
        position: relative;
        width: 100%;
        background: #ffffff;
        border-radius: 20px;
        padding: 28px 26px 24px;
        box-shadow: var(--wizz-shadow-lg);
        max-height: 90vh;
        overflow-y: auto;
        animation: popUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--wizz-text-muted);
        padding: 4px;
        display: inline-flex;
      }
      .modal-close:hover {
        color: var(--wizz-text);
      }
      .tone-badge {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 14px;
      }
      .tone-badge--warning {
        background: var(--wizz-amber-soft);
        color: var(--wizz-amber);
      }
      .tone-badge--success {
        background: var(--wizz-green-soft);
        color: var(--wizz-green);
      }
      .tone-badge--danger {
        background: var(--wizz-danger-soft);
        color: var(--wizz-danger);
      }
      .tone-badge--info {
        background: var(--wizz-primary-soft);
        color: var(--wizz-primary);
      }
      .modal-title {
        margin: 0 0 8px;
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--wizz-text);
        text-align: center;
      }
      .modal-title--left {
        text-align: left;
      }
      .modal-subtitle {
        margin: 0 0 18px;
        font-size: 0.84rem;
        line-height: 1.5;
        color: var(--wizz-text-secondary);
        text-align: center;
      }
      .modal-subtitle--left {
        text-align: left;
      }
      .modal-body {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .support-footer {
        margin-top: 18px;
        padding-top: 14px;
        border-top: 1px solid var(--wizz-border);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        font-size: 0.75rem;
        color: var(--wizz-text-muted);
        text-align: center;
      }
      .support-footer strong {
        color: var(--wizz-text-secondary);
        font-weight: 600;
      }

      /* Mobile bottom sheet behavior matching Figma mobile screens! */
      @media (max-width: 767px) {
        .modal-backdrop {
          align-items: flex-end;
          padding: 0;
        }
        .modal-card {
          max-width: 100% !important;
          border-radius: 24px 24px 0 0;
          padding: 26px 20px 28px;
          animation: slideSheetUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tone-badge {
          margin-left: 0;
        }
        .modal-title,
        .modal-subtitle {
          text-align: left;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes popUp {
        from {
          opacity: 0;
          transform: scale(0.96) translateY(8px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      @keyframes slideSheetUp {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class UiModalComponent {
  protected readonly theme = inject(ThemeService);

  readonly open = input<boolean>(false);
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly tone = input<ModalTone>('none');
  readonly align = input<'center' | 'left'>('center');
  readonly maxWidth = input<number>(440);
  readonly closable = input<boolean>(true);
  readonly closeOnBackdrop = input<boolean>(true);
  readonly showSupportFooter = input<boolean>(false);

  readonly closed = output<void>();

  onBackdropClick(): void {
    if (this.closable() && this.closeOnBackdrop()) {
      this.closed.emit();
    }
  }
}

@Component({
  selector: 'wizz-drawer',
  standalone: true,
  imports: [WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="drawer-backdrop" (click)="closed.emit()">
        <aside
          class="drawer-panel"
          [style.maxWidth.px]="width()"
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
        >
          <header class="drawer-header">
            <div>
              <h2 class="drawer-title">{{ title() }}</h2>
              @if (subtitle()) {
                <p class="drawer-subtitle">{{ subtitle() }}</p>
              }
            </div>
            <button
              type="button"
              class="drawer-close"
              (click)="closed.emit()"
              aria-label="Close drawer"
            >
              <wizz-icon name="x-circle" [size]="22" />
            </button>
          </header>

          <div class="drawer-content">
            <ng-content />
          </div>

          <footer class="drawer-footer">
            <ng-content select="[drawer-footer]" />
          </footer>
        </aside>
      </div>
    }
  `,
  styles: [
    `
      .drawer-backdrop {
        position: fixed;
        inset: 0;
        z-index: 950;
        background: rgba(14, 14, 20, 0.5);
        display: flex;
        justify-content: flex-end;
      }
      .drawer-panel {
        width: 100%;
        height: 100%;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        box-shadow: -12px 0 40px rgba(14, 14, 20, 0.18);
        animation: slideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .drawer-header {
        padding: 22px 26px 16px;
        border-bottom: 1px solid var(--wizz-border);
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }
      .drawer-title {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--wizz-text);
      }
      .drawer-subtitle {
        margin: 4px 0 0;
        font-size: 0.8125rem;
        color: var(--wizz-text-secondary);
      }
      .drawer-close {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--wizz-text-muted);
        padding: 4px;
        display: inline-flex;
      }
      .drawer-close:hover {
        color: var(--wizz-text);
      }
      .drawer-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px 26px;
      }
      .drawer-footer {
        padding: 16px 26px;
        border-top: 1px solid var(--wizz-border);
        background: #ffffff;
      }
      .drawer-footer:empty {
        display: none;
      }

      @media (max-width: 767px) {
        .drawer-panel {
          max-width: 100% !important;
        }
        .drawer-header,
        .drawer-content,
        .drawer-footer {
          padding-left: 18px;
          padding-right: 18px;
        }
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }
    `,
  ],
})
export class UiDrawerComponent {
  readonly open = input<boolean>(false);
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly width = input<number>(500);

  readonly closed = output<void>();
}
