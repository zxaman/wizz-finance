import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { SelectOption, UiButtonComponent, UiInputComponent, UiPhoneInputComponent, UiSelectComponent } from '@wizz/ui';
import { COUNTRIES } from '@wizz/utils';

/** Form value models are owned by the flow parent so switching steps preserves user input. */
@Component({
  selector: 'app-individual-signup-form',
  standalone: true,
  imports: [UiButtonComponent, UiInputComponent, UiPhoneInputComponent, UiSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="signup-form" (submit)="handleSubmit($event)">
      <header class="form-heading">
        <h1>Sign up on {{ brandName() }}</h1>
      </header>

      <wizz-input
        label="First Name"
        placeholder="Enter First Name"
        [(value)]="firstName"
        [error]="submitted() && !firstName().trim() ? 'First name is required' : ''"
      />

      <div class="two-col">
        <wizz-input label="Middle Name" placeholder="Enter Middle Name" [(value)]="middleName" />
        <wizz-input
          label="Last Name"
          placeholder="Enter Last Name"
          [(value)]="lastName"
          [error]="submitted() && !lastName().trim() ? 'Last name is required' : ''"
        />
      </div>

      <wizz-input
        label="Email Address"
        type="email"
        placeholder="Enter Email Address"
        [(value)]="email"
        [error]="emailError()"
      />

      <wizz-phone-input
        label="Mobile number"
        [(dialCode)]="dialCode"
        [(phone)]="phone"
        [error]="submitted() && phone().trim().length < 7 ? 'Please enter a valid mobile number' : ''"
      />

      <wizz-select
        label="Nationality"
        placeholder="Choose a Country"
        [options]="countryOptions"
        [(value)]="nationality"
        [error]="submitted() && !nationality() ? 'Please choose nationality' : ''"
      />

      <wizz-input
        label="Date Of Birth"
        type="date"
        [(value)]="dob"
        [error]="submitted() && !dob() ? 'Date of birth is required' : ''"
      />

      <wizz-input
        label="Enter Password"
        type="password"
        placeholder="Enter Password"
        [(value)]="password"
        hint="Use at least 12 characters with uppercase, lowercase, numbers, and symbols"
        [error]="passwordError()"
      />

      <wizz-input
        label="Confirm Password"
        type="password"
        placeholder="Enter Password Again"
        [(value)]="confirmPassword"
        [error]="confirmPasswordError()"
      />

      <label class="terms-check">
        <input
          type="checkbox"
          [checked]="agreedTerms()"
          (change)="agreedTerms.set($any($event.target).checked)"
        />
        <span>
          I agree with
          <button type="button" class="text-link" (click)="termsRequested.emit()">Privacy Policy</button>
          and
          <button type="button" class="text-link" (click)="termsRequested.emit()">Terms &amp; Conditions</button>
        </span>
      </label>
      @if (submitted() && !agreedTerms()) {
        <p class="inline-error">Please accept the Privacy Policy and Terms &amp; Conditions</p>
      }

      <wizz-button type="submit" size="lg" [fullWidth]="true">Finish Registration</wizz-button>

      <p class="mobile-signin-prompt">
        Have an account?
        <button type="button" class="text-link" (click)="loginRequested.emit()">Login</button>
      </p>
    </form>
  `,
  styles: [
    `
      .signup-form { display: flex; flex-direction: column; gap: 13px; }
      .form-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .form-heading h1 { margin: 0 0 4px; color: var(--wizz-text); font-size: 1.5rem; font-weight: 800; }
      .two-col { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      .terms-check { display: flex; align-items: flex-start; gap: 8px; margin-top: 2px; color: var(--wizz-text-secondary); font-size: .78rem; }
      .terms-check input { flex: 0 0 16px; width: 16px; height: 16px; margin: 0; accent-color: var(--wizz-primary); }
      .text-link { color: var(--wizz-primary); background: none; border: 0; padding: 0; font: inherit; font-weight: 500; cursor: pointer; }
      .text-link:hover { text-decoration: underline; }
      .text-link:focus-visible { outline: 2px solid var(--wizz-primary); outline-offset: 3px; border-radius: 3px; }
      .inline-error { margin: -6px 0 0; color: var(--wizz-danger); font-size: .75rem; }
      .mobile-signin-prompt { display: none; margin: 4px 0 0; color: var(--wizz-text-secondary); font-size: .82rem; text-align: center; }
      @media (max-width: 959px) { .mobile-signin-prompt { display: block; } }
      @media (max-width: 520px) { .two-col { grid-template-columns: 1fr; } }
    `,
  ],
})
export class IndividualSignupFormComponent {
  readonly firstName = model('');
  readonly middleName = model('');
  readonly lastName = model('');
  readonly email = model('');
  readonly dialCode = model('+1');
  readonly phone = model('');
  readonly nationality = model('');
  readonly dob = model('');
  readonly password = model('');
  readonly confirmPassword = model('');
  readonly agreedTerms = model(false);

  readonly brandName = input('Paygate');
  readonly submitted = input(false);
  readonly emailError = input('');
  readonly passwordError = input('');
  readonly confirmPasswordError = input('');

  readonly registrationSubmitted = output<void>();
  readonly termsRequested = output<void>();
  readonly loginRequested = output<void>();

  protected readonly countryOptions: readonly SelectOption[] = COUNTRIES.map((country) => ({
    value: country.name,
    label: country.name,
    prefix: country.flag,
  }));

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.registrationSubmitted.emit();
  }
}
