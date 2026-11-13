import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WizzIconComponent, WizzIconName } from './wizz-icon.component';

@Component({
  selector: 'wizz-input',
  standalone: true,
  imports: [FormsModule, WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="field-wrap">
      @if (label()) {
        <label class="field-label" [attr.for]="inputId()">
          {{ label() }}
          @if (required()) {
            <span class="req">*</span>
          }
        </label>
      }
      <div
        class="input-shell"
        [class.input-shell--error]="!!error()"
        [class.input-shell--disabled]="disabled()"
      >
        @if (leadingIcon(); as lIcon) {
          <span class="input-icon input-icon--left">
            <wizz-icon [name]="lIcon" [size]="17" />
          </span>
        }
        <input
          class="field-input"
          [id]="inputId()"
          [type]="effectiveType()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [attr.maxlength]="maxlength() ?? null"
          [ngModel]="value()"
          (ngModelChange)="value.set($event)"
        />
        @if (type() === 'password') {
          <button
            type="button"
            class="eye-btn"
            (click)="togglePassword()"
            [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
          >
            <wizz-icon [name]="showPassword() ? 'eye-off' : 'eye'" [size]="18" />
          </button>
        } @else if (trailingIcon(); as tIcon) {
          <span class="input-icon input-icon--right">
            <wizz-icon [name]="tIcon" [size]="17" />
          </span>
        }
      </div>

      @if (error()) {
        <p class="field-error">{{ error() }}</p>
      } @else if (hint()) {
        <p class="field-hint">{{ hint() }}</p>
      }
    </div>
  `,
  styles: [
    `
      .field-wrap {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
      }
      .field-label {
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--wizz-text);
      }
      .req {
        color: var(--wizz-danger);
        margin-left: 2px;
      }
      .input-shell {
        display: flex;
        align-items: center;
        height: 44px;
        border: 1px solid var(--wizz-border-strong);
        border-radius: var(--wizz-radius-sm);
        background: #ffffff;
        padding: 0 12px;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .input-shell:focus-within {
        border-color: var(--wizz-primary);
        box-shadow: 0 0 0 3px rgba(121, 101, 240, 0.14);
      }
      .input-shell--error {
        border-color: var(--wizz-danger);
      }
      .input-shell--error:focus-within {
        box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.12);
      }
      .input-shell--disabled {
        background: var(--wizz-surface-muted);
        opacity: 0.75;
      }
      .field-input {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent;
        font-size: 0.875rem;
        color: var(--wizz-text);
      }
      .field-input::placeholder {
        color: var(--wizz-text-muted);
      }
      .input-icon {
        color: var(--wizz-text-muted);
        display: inline-flex;
      }
      .input-icon--left {
        margin-right: 8px;
      }
      .input-icon--right {
        margin-left: 8px;
      }
      .eye-btn {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        color: var(--wizz-text-secondary);
        display: inline-flex;
        align-items: center;
      }
      .field-hint {
        margin: 0;
        font-size: 0.75rem;
        line-height: 1.4;
        color: var(--wizz-text-muted);
      }
      .field-error {
        margin: 0;
        font-size: 0.75rem;
        line-height: 1.4;
        color: var(--wizz-danger);
      }
    `,
  ],
})
export class UiInputComponent {
  private static nextId = 0;
  readonly inputId = signal(`wizz-input-${++UiInputComponent.nextId}`);

  readonly value = model<string>('');
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<'text' | 'email' | 'password' | 'date' | 'number' | 'tel' | 'url'>('text');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly maxlength = input<number | undefined>(undefined);
  readonly leadingIcon = input<WizzIconName | undefined>(undefined);
  readonly trailingIcon = input<WizzIconName | undefined>(undefined);

  readonly showPassword = signal(false);

  readonly effectiveType = computed(() => {
    if (this.type() === 'password') {
      return this.showPassword() ? 'text' : 'password';
    }
    return this.type();
  });

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
}
