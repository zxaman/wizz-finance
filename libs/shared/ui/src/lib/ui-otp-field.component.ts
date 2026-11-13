import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'wizz-otp-field',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="otp-block">
      @if (sentMessage()) {
        <p class="sent-msg" [innerHTML]="sentMessage()"></p>
      }
      <label class="otp-label">{{ label() }}</label>
      <div class="otp-input-wrap" [class.otp-input-wrap--error]="!!error()">
        <input
          type="text"
          inputmode="numeric"
          maxlength="6"
          class="otp-input"
          [placeholder]="placeholder()"
          [ngModel]="value()"
          (ngModelChange)="onCodeChange($event)"
        />
      </div>
      @if (error()) {
        <p class="otp-error">{{ error() }}</p>
      }
      <div class="resend-row">
        @if (secondsLeft() > 0) {
          <span class="timer-text">
            Get the code again in <strong>{{ formattedTimer() }}</strong>
          </span>
        } @else {
          <span class="timer-text">Didn't receive the code?</span>
        }
        <button
          type="button"
          class="resend-btn"
          [disabled]="secondsLeft() > 0 && lockResendUntilZero()"
          (click)="handleResend()"
        >
          Resend
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .otp-block {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .sent-msg {
        margin: 0 0 2px;
        font-size: 0.8125rem;
        color: var(--wizz-text-secondary);
      }
      .otp-label {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--wizz-text);
      }
      .otp-input-wrap {
        height: 44px;
        border: 1px solid var(--wizz-border-strong);
        border-radius: var(--wizz-radius-sm);
        display: flex;
        align-items: center;
        padding: 0 12px;
        background: #ffffff;
      }
      .otp-input-wrap:focus-within {
        border-color: var(--wizz-primary);
        box-shadow: 0 0 0 3px rgba(121, 101, 240, 0.14);
      }
      .otp-input-wrap--error {
        border-color: var(--wizz-danger);
      }
      .otp-input {
        width: 100%;
        border: none;
        outline: none;
        font-size: 0.92rem;
        letter-spacing: 0.12em;
        font-weight: 600;
        color: var(--wizz-text);
      }
      .otp-input::placeholder {
        letter-spacing: normal;
        font-weight: 400;
        color: var(--wizz-text-muted);
      }
      .otp-error {
        margin: 0;
        font-size: 0.75rem;
        color: var(--wizz-danger);
      }
      .resend-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
        color: var(--wizz-text-muted);
      }
      .resend-btn {
        background: none;
        border: none;
        padding: 0;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--wizz-primary);
        cursor: pointer;
      }
      .resend-btn:disabled {
        color: var(--wizz-text-muted);
        cursor: not-allowed;
      }
    `,
  ],
})
export class UiOtpFieldComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly value = model<string>('');
  readonly label = input<string>('Verification Code');
  readonly placeholder = input<string>('Enter 6 digit Verification Code');
  readonly sentMessage = input<string>('');
  readonly error = input<string>('');
  readonly initialSeconds = input<number>(102);
  readonly lockResendUntilZero = input<boolean>(false);

  readonly resend = output<void>();

  readonly secondsLeft = signal(102);

  readonly formattedTimer = computed(() => {
    const s = this.secondsLeft();
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    if (mins > 0) {
      return `${mins} minute ${secs} seconds`;
    }
    return `${secs} seconds`;
  });

  constructor() {
    this.secondsLeft.set(this.initialSeconds());
    const id = setInterval(() => {
      this.secondsLeft.update((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }

  onCodeChange(raw: string): void {
    this.value.set(raw.replace(/\D/g, '').slice(0, 6));
  }

  handleResend(): void {
    this.secondsLeft.set(this.initialSeconds());
    this.resend.emit();
  }
}
