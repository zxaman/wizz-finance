import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { COUNTRIES } from '@wizz/utils';
import { WizzIconComponent } from './wizz-icon.component';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly prefix?: string;
}

@Component({
  selector: 'wizz-select',
  standalone: true,
  imports: [FormsModule, WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="field-wrap">
      @if (label()) {
        <label class="field-label">{{ label() }}</label>
      }
      <div class="select-shell" [class.select-shell--error]="!!error()">
        <select
          class="field-select"
          [disabled]="disabled()"
          [ngModel]="value()"
          (ngModelChange)="value.set($event)"
        >
          @if (placeholder()) {
            <option value="" disabled>{{ placeholder() }}</option>
          }
          @for (opt of options(); track opt.value) {
            <option [value]="opt.value">
              {{ opt.prefix ? opt.prefix + ' ' : '' }}{{ opt.label }}
            </option>
          }
        </select>
        <span class="select-chevron">
          <wizz-icon name="chevron-down" [size]="16" />
        </span>
      </div>
      @if (error()) {
        <p class="field-error">{{ error() }}</p>
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
      .select-shell {
        position: relative;
        display: flex;
        align-items: center;
        height: 44px;
        border: 1px solid var(--wizz-border-strong);
        border-radius: var(--wizz-radius-sm);
        background: #ffffff;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .select-shell:focus-within {
        border-color: var(--wizz-primary);
        box-shadow: 0 0 0 3px rgba(121, 101, 240, 0.14);
      }
      .select-shell--error {
        border-color: var(--wizz-danger);
      }
      .field-select {
        width: 100%;
        height: 100%;
        padding: 0 36px 0 12px;
        border: none;
        outline: none;
        background: transparent;
        appearance: none;
        font-size: 0.875rem;
        color: var(--wizz-text);
        cursor: pointer;
      }
      .select-chevron {
        position: absolute;
        right: 12px;
        pointer-events: none;
        color: var(--wizz-text-secondary);
        display: inline-flex;
      }
      .field-error {
        margin: 0;
        font-size: 0.75rem;
        color: var(--wizz-danger);
      }
    `,
  ],
})
export class UiSelectComponent {
  readonly value = model<string>('');
  readonly options = input<readonly SelectOption[]>([]);
  readonly label = input<string>('');
  readonly placeholder = input<string>('Select an option');
  readonly error = input<string>('');
  readonly disabled = input<boolean>(false);
}

@Component({
  selector: 'wizz-phone-input',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="field-wrap">
      @if (label()) {
        <label class="field-label">{{ label() }}</label>
      }
      <div class="phone-shell" [class.phone-shell--error]="!!error()">
        <select
          class="dial-select"
          [ngModel]="dialCode()"
          (ngModelChange)="dialCode.set($event)"
          aria-label="Country code"
        >
          @for (c of countries; track c.code) {
            <option [value]="c.dialCode">{{ c.flag }} {{ c.dialCode }}</option>
          }
        </select>
        <span class="divider"></span>
        <input
          type="tel"
          class="phone-input"
          [placeholder]="placeholder()"
          [ngModel]="phone()"
          (ngModelChange)="phone.set($event)"
        />
      </div>
      @if (error()) {
        <p class="field-error">{{ error() }}</p>
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
      .phone-shell {
        display: flex;
        align-items: center;
        height: 44px;
        border: 1px solid var(--wizz-border-strong);
        border-radius: var(--wizz-radius-sm);
        background: #ffffff;
        padding: 0 12px 0 8px;
      }
      .phone-shell:focus-within {
        border-color: var(--wizz-primary);
        box-shadow: 0 0 0 3px rgba(121, 101, 240, 0.14);
      }
      .phone-shell--error {
        border-color: var(--wizz-danger);
      }
      .dial-select {
        border: none;
        outline: none;
        background: transparent;
        font-size: 0.85rem;
        color: var(--wizz-text);
        cursor: pointer;
        padding-right: 4px;
      }
      .divider {
        width: 1px;
        height: 22px;
        background: var(--wizz-border);
        margin: 0 10px 0 6px;
      }
      .phone-input {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        font-size: 0.875rem;
        color: var(--wizz-text);
      }
      .phone-input::placeholder {
        color: var(--wizz-text-muted);
      }
      .field-error {
        margin: 0;
        font-size: 0.75rem;
        color: var(--wizz-danger);
      }
    `,
  ],
})
export class UiPhoneInputComponent {
  protected readonly countries = COUNTRIES;
  readonly dialCode = model<string>('+1');
  readonly phone = model<string>('');
  readonly label = input<string>('Mobile number');
  readonly placeholder = input<string>('Contact number here');
  readonly error = input<string>('');
}
