import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AuthSplitShellComponent,
  FocusedFlowShellComponent,
} from '@wizz/remittance-shell';
import {
  BrandLogoComponent,
  UiBadgeComponent,
  UiButtonComponent,
  UiDrawerComponent,
  UiInputComponent,
  UiModalComponent,
  UiOtpFieldComponent,
  UiPhoneInputComponent,
  UiSelectComponent,
  WizzIconComponent,
} from '@wizz/ui';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    AuthSplitShellComponent,
    FocusedFlowShellComponent,
    BrandLogoComponent,
    UiBadgeComponent,
    UiButtonComponent,
    UiDrawerComponent,
    UiInputComponent,
    UiModalComponent,
    UiOtpFieldComponent,
    UiPhoneInputComponent,
    UiSelectComponent,
    WizzIconComponent,
  ],
  template: `
    <!-- Screen 02 & 03 & 04 & 18 Inline -->
    <wizz-auth-split-shell>
      <div class="auth-split-left">
        <wizz-brand-logo [customLabel]="'Partner'" />
        <div class="promo-content">
          <h2>Local Accounts in Global Currencies</h2>
          <p>Partner-branded white-label remittance portal for your clients.</p>
          <img src="/assets/auth-promo.jpg" alt="Partner Promo" class="promo-img" />
        </div>
      </div>

      <div class="auth-split-right">
        <wizz-focused-flow-shell title="Create Partner Account">
          <!-- Step 1: Profile Type & Individual Form (Screen 02) -->
          @if (step() === 0) {
            <div class="form-stack">
              <div class="type-selector">
                <label class="radio-card radio-card--selected">
                  <span><wizz-icon name="user" [size]="15" /> Individual</span>
                  <input type="radio" checked readonly />
                </label>
                <div class="radio-card radio-card--disabled">
                  <span><wizz-icon name="building-2" [size]="15" /> Organisation</span>
                  <wizz-badge tone="coming-soon">Coming Soon</wizz-badge>
                </div>
              </div>

              <wizz-input label="First Name" placeholder="Enter first name" [(value)]="firstName" />
              <wizz-input label="Last Name" placeholder="Enter last name" [(value)]="lastName" />
              <wizz-input label="Email" type="email" placeholder="partner@example.com" [(value)]="email" />
              <wizz-phone-input label="Mobile Number" [(dialCode)]="dialCode" [(phone)]="phone" />
              <wizz-select label="Nationality" [options]="countryOptions" [(value)]="nationality" />
              <wizz-input label="Date of Birth" type="date" [(value)]="dob" />
              <wizz-input label="Password" type="password" placeholder="Min 12 chars" [(value)]="password" />

              <div class="terms-row">
                <input type="checkbox" [ngModel]="termsAccepted()" (ngModelChange)="termsAccepted.set($event)" />
                <span>I agree to the <a routerLink="/terms" class="link">Terms &amp; Conditions</a></span>
              </div>

              <wizz-button [fullWidth]="true" (clicked)="nextStep()">
                Continue
              </wizz-button>
            </div>
          }

          <!-- Step 2: Uniqueness Check Modals (Screen 03) -->
          @if (step() === 1) {
            <div class="form-stack">
              <p class="status-text">Verifying account uniqueness...</p>
              <wizz-button variant="outline" [fullWidth]="true" (clicked)="step.set(0)">
                Edit Details
              </wizz-button>
            </div>
          }

          <!-- Step 3: Verify Email & Phone OTP (Screen 04) -->
          @if (step() === 2) {
            <div class="form-stack">
              <h3>Verify Your Identity</h3>
              <p class="sub">We've sent codes to {{ email() }} and {{ dialCode() }} {{ phone() }}</p>

              <wizz-otp-field label="Email OTP" [(value)]="emailOtp" />
              <wizz-otp-field label="Phone OTP" [(value)]="phoneOtp" />

              <div class="timer-row">
                <span>Resend in: {{ resendTimer() }}s</span>
                <button type="button" class="link" [disabled]="resendTimer() > 0" (click)="resetTimer()">
                  Resend Codes
                </button>
              </div>

              <wizz-button [fullWidth]="true" (clicked)="completeSignup()">
                Verify &amp; Create Account
              </wizz-button>
            </div>
          }

          <!-- Step 4: Account Created Confirmation (Screen 04) -->
          @if (step() === 3) {
            <div class="success-stack">
              <wizz-icon name="check-circle" [size]="64" class="success-icon" />
              <h2>Account Created Successfully</h2>
              <p class="sub">Welcome to the Partner Portal, {{ firstName() }} {{ lastName() }}</p>
              <wizz-button [fullWidth]="true" (clicked)="go('/dashboard')">
                Go to Dashboard
              </wizz-button>
            </div>
          }
        </wizz-focused-flow-shell>
      </div>
    </wizz-auth-split-shell>

    <!-- Inline Terms Modal (Screen 18) -->
    <wizz-modal [open]="showTerms()" title="Terms &amp; Conditions" (closed)="showTerms.set(false)">
      <div class="terms-content">
        <p>Last Updated on - 2 May 2025</p>
        <p>Partner portal terms apply...</p>
      </div>
      <div drawer-footer>
        <wizz-button [fullWidth]="true" (clicked)="showTerms.set(false); termsAccepted.set(true)">
          I Agree
        </wizz-button>
      </div>
    </wizz-modal>

    <!-- Uniqueness Modals (Screen 03) -->
    <wizz-modal [open]="modalType() === 'existing'" title="Account Exists" (closed)="modalType.set(null)">
      <p>An account with this email already exists.</p>
      <div drawer-footer>
        <wizz-button [fullWidth]="true" (clicked)="modalType.set(null); go('/auth/login')">
          Login Instead
        </wizz-button>
      </div>
    </wizz-modal>

    <wizz-modal [open]="modalType() === 'partner-linked'" title="Partner Linked" (closed)="modalType.set(null)">
      <p>This email is already linked to an existing partner account (MO*****T).</p>
      <div drawer-footer>
        <wizz-button [fullWidth]="true" (clicked)="modalType.set(null)">
          Go Back
        </wizz-button>
      </div>
    </wizz-modal>
  `,
  styles: [
    `
      .auth-split-left {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        background: #0e0e14;
        color: #ffffff;
      }
      .promo-content {
        margin-top: 32px;
        text-align: center;
      }
      .promo-content h2 {
        margin: 0 0 8px;
        font-size: 1.4rem;
      }
      .promo-content p {
        margin: 0;
        font-size: 0.88rem;
        color: #cbd5e1;
      }
      .promo-img {
        margin-top: 24px;
        max-width: 320px;
        border-radius: 12px;
      }

      .auth-split-right {
        padding: 40px;
      }
      .form-stack,
      .success-stack {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .type-selector {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .radio-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 11px 12px;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        font-size: 0.8rem;
        font-weight: 600;
      }
      .radio-card--selected {
        border-color: #7965f0;
        background: #ede9fe;
        color: #7965f0;
      }
      .radio-card--disabled {
        opacity: 0.65;
        background: #f8fafc;
      }
      .terms-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
      }
      .link {
        color: #7965f0;
        text-decoration: none;
      }
      .timer-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #64748b;
      }
      .success-stack {
        text-align: center;
        padding: 20px 0;
      }
      .success-icon {
        color: #44b767;
        margin-bottom: 16px;
      }
      .success-stack h2 {
        margin: 0 0 8px;
      }
      .success-stack .sub {
        margin: 0;
        color: #64748b;
      }

      .terms-content {
        font-size: 0.84rem;
        line-height: 1.5;
        color: #1e293b;
      }
    `,
  ],
})
export class SignupPageComponent {
  readonly countryOptions = [
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'India', label: 'India' },
  ];

  readonly step = signal(0);
  readonly modalType = signal<'existing' | 'partner-linked' | null>(null);
  readonly showTerms = signal(false);
  readonly termsAccepted = signal(false);

  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly email = signal('');
  readonly dialCode = signal('+1');
  readonly phone = signal('');
  readonly nationality = signal('United States');
  readonly dob = signal('');
  readonly password = signal('');

  readonly emailOtp = signal('');
  readonly phoneOtp = signal('');
  readonly resendTimer = signal(60);

  nextStep(): void {
    if (!this.termsAccepted()) {
      this.showTerms.set(true);
      return;
    }
    // Mock uniqueness check
    if (this.email() === 'partner@example.com') {
      this.modalType.set('existing');
      return;
    }
    // This prototype has no remote uniqueness API, so skip the simulated wait.
    this.step.set(2);
  }

  completeSignup(): void {
    if (this.emailOtp().length === 6 && this.phoneOtp().length === 6) {
      this.step.set(3);
    }
  }

  resetTimer(): void {
    this.resendTimer.set(60);
    const int = setInterval(() => {
      const t = this.resendTimer();
      if (t > 0) this.resendTimer.set(t - 1);
      else clearInterval(int);
    }, 1000);
  }

  go(path: string): void {
    // In a real app, use router.navigate
  }
}
