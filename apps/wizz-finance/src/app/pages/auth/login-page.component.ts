import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ThemeService } from '@wizz/design-tokens';
import { WizzPlatformStore } from '@wizz/remittance-data-access';
import { AuthSplitShellComponent } from '@wizz/remittance-shell';
import {
  ToastService,
  UiButtonComponent,
  UiInputComponent,
  UiModalComponent,
  UiOtpFieldComponent,
  WizzIconComponent,
} from '@wizz/ui';
import { isValidEmail } from '@wizz/utils';

type LoginModalKind =
  | null
  | 'mfa'
  | 'verify-contact'
  | 'oauth-consent'
  | 'social-new-account'
  | 'locked'
  | 'social-failed'
  | 'invalid-creds';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    AuthSplitShellComponent,
    UiButtonComponent,
    UiInputComponent,
    UiModalComponent,
    UiOtpFieldComponent,
    WizzIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wizz-auth-split-shell
      backLabel="Back To Home"
      altActionLabel="Create Account Now"
      (backClicked)="go('/')"
      (altActionClicked)="go('/auth/signup')"
    >
      <div class="login-box">
        <div class="head-row">
          <h1>Login to your {{ theme.brandName() }} account</h1>
          <button
            type="button"
            class="demo-chip"
            (click)="showScenarioBar.update(v => !v)"
          >
            <wizz-icon name="sparkles" [size]="13" />
            <span>States</span>
          </button>
        </div>

        @if (showScenarioBar()) {
          <div class="scenario-strip">
            <span class="scenario-label">Test Figma Flows (05 &amp; 07):</span>
            <div class="scenario-btns">
              <button type="button" (click)="loginAsFreshUser()">05: Fresh User Setup</button>
              <button type="button" (click)="activeModal.set('mfa')">05: MFA Authenticator</button>
              <button type="button" (click)="openSocialOAuth('google', true)">
                07: New Social User
              </button>
              <button type="button" (click)="triggerLockedAccount()">05: Account Locked</button>
              <button type="button" (click)="activeModal.set('social-failed')">
                07: OAuth Denied
              </button>
            </div>
          </div>
        }

        <!-- Screen 05 & 07: Social Login Buttons -->
        <div class="social-row">
          <button
            type="button"
            class="social-btn social-btn--google"
            (click)="openSocialOAuth('google', false)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.8 9.1-9.2 0-.6-.1-1.1-.2-1.6H12z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            class="social-btn social-btn--apple"
            (click)="openSocialOAuth('apple', false)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
              />
            </svg>
            <span>Apple</span>
          </button>
        </div>

        <div class="or-divider">
          <span>Or Login With</span>
        </div>

        <form class="login-form" (ngSubmit)="submitLogin()">
          <wizz-input
            label="Email Address"
            type="email"
            placeholder="ajay@gmail.com"
            [(value)]="email"
            [error]="submitted() && !isValidEmailFn(email()) ? 'Please enter a valid email address' : ''"
          />

          <div class="pwd-group">
            <wizz-input
              label="Enter Password"
              type="password"
              placeholder="Enter Password"
              [(value)]="password"
              [error]="submitted() && !password() ? 'Password is required' : ''"
            />
            <div class="forgot-row">
              <a routerLink="/auth/forgot-password" class="forgot-link">Forgot Password?</a>
            </div>
          </div>

          <wizz-button type="submit" size="lg" [fullWidth]="true">Login</wizz-button>
        </form>

        <p class="mobile-signup-prompt">
          Don't have an account?
          <a routerLink="/auth/signup" class="wizz-link">Create Account</a>
        </p>
      </div>
    </wizz-auth-split-shell>

    <!-- Screen 05: Google Authenticator MFA Modal -->
    <wizz-modal
      [open]="activeModal() === 'mfa'"
      title="Google Authenticator"
      subtitle="Enter your Google Authenticator passcode"
      [maxWidth]="380"
      (closed)="activeModal.set(null)"
    >
      <div class="mfa-asterisk" aria-hidden="true">✳</div>
      <wizz-input
        label="Enter Code"
        placeholder="6-digit authenticator code"
        [maxlength]="6"
        [(value)]="mfaCode"
      />
      <wizz-button [fullWidth]="true" (clicked)="completeMfaLogin()">Verify</wizz-button>
    </wizz-modal>

    <!-- Screen 05: Fresh User Unverified Contact OTP Modal -->
    <wizz-modal
      [open]="activeModal() === 'verify-contact'"
      align="left"
      title="Please verify your email and phone"
      [maxWidth]="450"
      (closed)="activeModal.set(null)"
    >
      <wizz-otp-field
        label="Email Verification Code"
        [sentMessage]="'A code has been sent to <strong>' + email() + '</strong>'"
        [(value)]="freshEmailOtp"
        (resend)="toast.show('A new email code has been sent', 'success')"
      />
      <wizz-otp-field
        label="Mobile Verification Code"
        sentMessage="A code has been sent to <strong>+1 (314) 232 1112</strong>"
        [(value)]="freshPhoneOtp"
        (resend)="toast.show('A new SMS code has been sent', 'success')"
      />
      <wizz-button [fullWidth]="true" (clicked)="completeFreshUserVerify()">
        Verify Email and Phone
      </wizz-button>
    </wizz-modal>

    <!-- Screen 07: Google / Apple OAuth Consent Modal -->
    <wizz-modal
      [open]="activeModal() === 'oauth-consent'"
      align="left"
      [title]="'Sign in with ' + (oauthProvider() === 'google' ? 'Google' : 'Apple')"
      subtitle="Confirm your choices to share account permissions with Paygate"
      [maxWidth]="420"
      (closed)="activeModal.set(null)"
    >
      <div class="oauth-box">
        <div class="oauth-account">
          <span class="oauth-avatar">A</span>
          <div>
            <strong>Ajay Shekhawat</strong>
            <span>{{ email() }}</span>
          </div>
        </div>

        <label class="perm-row">
          <input type="checkbox" checked disabled />
          <span>See your primary account email address</span>
        </label>
        <label class="perm-row">
          <input type="checkbox" [ngModel]="oauthConsentGranted()" (ngModelChange)="oauthConsentGranted.set($event)" />
          <span>Associate you with your personal profile info</span>
        </label>

        <label class="perm-row perm-row--highlight">
          <input type="checkbox" [ngModel]="simulateNewSocialUser()" (ngModelChange)="simulateNewSocialUser.set($event)" />
          <span>Simulate first-time social user (triggers Screen 07/08 profile setup)</span>
        </label>
      </div>

      <div class="oauth-actions">
        <wizz-button variant="outline" (clicked)="activeModal.set('social-failed')">
          Cancel
        </wizz-button>
        <wizz-button (clicked)="confirmSocialOAuth()">Allow</wizz-button>
      </div>
    </wizz-modal>

    <!-- Screen 07: If Account Doesn't Exist -> Create New Account -->
    <wizz-modal
      [open]="activeModal() === 'social-new-account'"
      tone="success"
      title="Create New Account"
      subtitle="Your Paygate account is created successfully. We need a few more details to finish setup."
      (closed)="activeModal.set(null)"
    >
      <wizz-button [fullWidth]="true" (clicked)="proceedToSocialProfileSetup()">
        Continue Setup
      </wizz-button>
    </wizz-modal>

    <!-- Screen 05 & 07 Error: Account Temporarily Locked with Countdown -->
    <wizz-modal
      [open]="activeModal() === 'locked'"
      tone="danger"
      title="Your Account Is Temporarily Locked"
      subtitle="We've blocked login attempts after multiple failed login attempts to protect your account."
      [showSupportFooter]="true"
      (closed)="activeModal.set(null)"
    >
      <div class="lock-timer-box">
        <span>Try logging in after</span>
        <strong>{{ formattedLockTimer() }}</strong>
      </div>
      <wizz-button [fullWidth]="true" [disabled]="lockSeconds() > 0" (clicked)="activeModal.set(null)">
        Try Again
      </wizz-button>
    </wizz-modal>

    <!-- Screen 07 Error: Social Login Failed -->
    <wizz-modal
      [open]="activeModal() === 'social-failed'"
      tone="warning"
      title="Login Failed"
      subtitle="Provider denied consent. Please allow the required permissions or use another method."
      (closed)="activeModal.set(null)"
    >
      <div class="two-btns">
        <wizz-button [fullWidth]="true" (clicked)="activeModal.set('oauth-consent')">
          Try Again
        </wizz-button>
        <wizz-button variant="outline" [fullWidth]="true" (clicked)="activeModal.set(null)">
          Use Email and Password
        </wizz-button>
      </div>
    </wizz-modal>

    <!-- Screen 05 Error: Invalid Credentials -->
    <wizz-modal
      [open]="activeModal() === 'invalid-creds'"
      tone="warning"
      title="Invalid Email or Password"
      subtitle="The credentials you entered did not match our records. Please double-check and try again."
      (closed)="activeModal.set(null)"
    >
      <wizz-button [fullWidth]="true" (clicked)="activeModal.set(null)">Try Again</wizz-button>
    </wizz-modal>
  `,
  styles: [
    `
      .login-box h1 {
        margin: 0;
        font-size: 1.48rem;
        font-weight: 800;
        color: var(--wizz-text);
      }
      .head-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 20px;
      }
      .demo-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        border-radius: 999px;
        border: 1px solid var(--wizz-primary-border);
        background: var(--wizz-primary-soft);
        color: var(--wizz-primary);
        font-size: 0.72rem;
        font-weight: 600;
        cursor: pointer;
        flex-shrink: 0;
      }
      .scenario-strip {
        margin-bottom: 16px;
        padding: 10px 12px;
        border-radius: 10px;
        background: #f7f6ff;
        border: 1px dashed var(--wizz-primary-border);
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .scenario-label {
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--wizz-text-secondary);
      }
      .scenario-btns {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .scenario-btns button {
        font-size: 0.7rem;
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid var(--wizz-border);
        background: #ffffff;
        cursor: pointer;
        font-weight: 600;
      }
      .scenario-btns button:hover {
        border-color: var(--wizz-primary);
        color: var(--wizz-primary);
      }

      .social-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 18px;
      }
      .social-btn {
        height: 42px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 0.84rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .social-btn:hover {
        transform: translateY(-1px);
      }
      .social-btn--google {
        background: #ffffff;
        border: 1px solid var(--wizz-border-strong);
        color: var(--wizz-text);
      }
      .social-btn--apple {
        background: #0d0e12;
        border: 1px solid #0d0e12;
        color: #ffffff;
      }
      .or-divider {
        position: relative;
        text-align: center;
        margin: 4px 0 18px;
      }
      .or-divider::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 1px;
        background: var(--wizz-border);
      }
      .or-divider span {
        position: relative;
        background: #ffffff;
        padding: 0 12px;
        font-size: 0.75rem;
        color: var(--wizz-text-muted);
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .pwd-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .forgot-row {
        display: flex;
        justify-content: flex-end;
      }
      .forgot-link {
        font-size: 0.76rem;
        font-weight: 600;
        color: var(--wizz-primary);
      }
      .mobile-signup-prompt {
        display: none;
        text-align: center;
        margin-top: 16px;
        font-size: 0.82rem;
        color: var(--wizz-text-secondary);
      }

      /* Modals */
      .mfa-asterisk {
        width: 48px;
        height: 48px;
        margin: -6px auto 4px;
        border-radius: 14px;
        background: #f1f5ff;
        color: #2563eb;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
      }
      .oauth-box {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .oauth-account {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 10px;
        background: var(--wizz-surface-muted);
      }
      .oauth-avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: var(--wizz-primary);
        color: #ffffff;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .oauth-account strong {
        display: block;
        font-size: 0.84rem;
      }
      .oauth-account span {
        font-size: 0.75rem;
        color: var(--wizz-text-muted);
      }
      .perm-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 0.78rem;
        color: var(--wizz-text-secondary);
      }
      .perm-row--highlight {
        padding: 8px 10px;
        border-radius: 8px;
        background: var(--wizz-primary-soft);
        color: var(--wizz-text);
        font-weight: 500;
      }
      .oauth-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      .lock-timer-box {
        padding: 14px;
        border-radius: 12px;
        background: var(--wizz-surface-muted);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .lock-timer-box span {
        font-size: 0.75rem;
        color: var(--wizz-text-muted);
      }
      .lock-timer-box strong {
        font-size: 1.35rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        color: var(--wizz-text);
      }
      .two-btns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      @media (max-width: 959px) {
        .mobile-signup-prompt {
          display: block;
        }
      }
      @media (max-width: 480px) {
        .two-btns {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class LoginPageComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly toast = inject(ToastService);
  protected readonly isValidEmailFn = isValidEmail;
  private readonly store = inject(WizzPlatformStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly showScenarioBar = signal(false);
  readonly activeModal = signal<LoginModalKind>(null);
  readonly submitted = signal(false);

  readonly email = signal('ajay@gmail.com');
  readonly password = signal('Paygate@2026!');
  readonly mfaCode = signal('482910');
  readonly freshEmailOtp = signal('123456');
  readonly freshPhoneOtp = signal('654321');

  readonly oauthProvider = signal<'google' | 'apple'>('google');
  readonly oauthConsentGranted = signal(true);
  readonly simulateNewSocialUser = signal(false);

  readonly lockSeconds = signal(878); // 00:14:38 from Figma Screen 05!
  readonly formattedLockTimer = computed(() => {
    const total = this.lockSeconds();
    const mins = String(Math.floor(total / 60)).padStart(2, '0');
    const secs = String(total % 60).padStart(2, '0');
    return `00 : ${mins} : ${secs}`;
  });

  constructor() {
    const timer = setInterval(() => {
      if (this.activeModal() === 'locked') {
        this.lockSeconds.update((s) => (s > 0 ? s - 1 : 0));
      }
    }, 1000);
    this.destroyRef.onDestroy(() => clearInterval(timer));

    this.route.queryParamMap.subscribe((params) => {
      if (params.get('demo') === 'social') {
        this.showScenarioBar.set(true);
        this.openSocialOAuth('google', true);
      }
    });
  }

  submitLogin(): void {
    this.submitted.set(true);
    if (!isValidEmail(this.email()) || !this.password()) return;

    if (this.password() === 'wrong') {
      this.activeModal.set('invalid-creds');
      return;
    }

    this.store.loginWithEmail(this.email().trim());

    if (this.store.user().mfaEnabled) {
      this.activeModal.set('mfa');
      return;
    }

    if (!this.store.user().emailVerified || !this.store.user().phoneVerified) {
      this.activeModal.set('verify-contact');
      return;
    }

    if (this.store.onboardingStepsCompleted() < 3) {
      this.router.navigate(['/onboarding']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  loginAsFreshUser(): void {
    this.store.personalDetailsCompleted.set(false);
    this.store.livenessCompleted.set(false);
    this.activeModal.set('verify-contact');
  }

  completeFreshUserVerify(): void {
    this.store.markContactVerified(true, true);
    this.activeModal.set(null);
    this.router.navigate(['/onboarding']);
  }

  completeMfaLogin(): void {
    this.activeModal.set(null);
    this.toast.show('MFA verified successfully', 'success');
    this.router.navigate(['/dashboard']);
  }

  openSocialOAuth(provider: 'google' | 'apple', asNew: boolean): void {
    this.oauthProvider.set(provider);
    this.oauthConsentGranted.set(true);
    this.simulateNewSocialUser.set(asNew);
    this.activeModal.set('oauth-consent');
  }

  confirmSocialOAuth(): void {
    if (!this.oauthConsentGranted()) {
      this.activeModal.set('social-failed');
      return;
    }
    this.store.loginWithSocial(this.oauthProvider(), this.simulateNewSocialUser());
    if (this.simulateNewSocialUser()) {
      this.activeModal.set('social-new-account');
    } else {
      this.activeModal.set(null);
      this.router.navigate(['/dashboard']);
    }
  }

  proceedToSocialProfileSetup(): void {
    this.activeModal.set(null);
    this.router.navigate(['/onboarding/personal-details'], {
      queryParams: { social: '1' },
    });
  }

  triggerLockedAccount(): void {
    this.lockSeconds.set(878);
    this.activeModal.set('locked');
  }

  go(path: string): void {
    this.router.navigate([path]);
  }
}
