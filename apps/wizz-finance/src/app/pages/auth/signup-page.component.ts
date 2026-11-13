import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ThemeService } from '@wizz/design-tokens';
import { WizzPlatformStore } from '@wizz/remittance-data-access';
import { AuthSplitShellComponent } from '@wizz/remittance-shell';
import { IndividualSignupFormComponent } from './individual-signup-form.component';
import { SignupProfileTypeStepComponent } from './signup-profile-type-step.component';
import {
  BrandLogoComponent,
  ToastService,
  UiButtonComponent,
  UiModalComponent,
  UiOtpFieldComponent,
  WizzIconComponent,
} from '@wizz/ui';
import { isAdult, isValidEmail, maskEmail, maskPhone, validateStrongPassword } from '@wizz/utils';

type SignupStep = 'profile-type' | 'form' | 'terms' | 'success' | 'pending';
type SignupModalKind =
  | null
  | 'age-error'
  | 'system-error'
  | 'unique-exists'
  | 'unique-similar'
  | 'unique-partner'
  | 'verify-otp'
  | 'otp-too-many'
  | 'otp-incomplete'
  | 'faq';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [
    RouterLink,
    AuthSplitShellComponent,
    SignupProfileTypeStepComponent,
    IndividualSignupFormComponent,
    BrandLogoComponent,
    UiButtonComponent,
    UiOtpFieldComponent,
    UiModalComponent,
    WizzIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (step() === 'terms') {
      <!-- Screen 02 & 18: Inline Terms & Conditions Consent View -->
      <div class="terms-standalone">
        <div class="terms-container">
          <div class="terms-brand">
            <wizz-brand-logo />
          </div>
          <div class="terms-top-row">
            <button type="button" class="back-heading" (click)="step.set('form')">
              <wizz-icon name="chevron-left" [size]="20" />
              <span>Terms and Conditions</span>
            </button>
            <wizz-button size="sm" (clicked)="acceptTermsAndReturn()">I Agree</wizz-button>
          </div>
          <p class="updated-date">Last Updated on - {{ theme.brand().lastTermsUpdate }}</p>

          <div class="terms-prose">
            <p>
              As you begin this exciting adventure with us, we want to emphasize that your privacy
              and security are our highest priorities. We have put in place strong measures to
              safeguard your personal information and ensure that your data is treated with the
              greatest care. Our dedicated team is committed to maintaining a secure environment,
              allowing you to fully enjoy the features and benefits our platform provides.
            </p>
            <p>
              In addition, we value the importance of community and collaboration. We encourage you
              to join our regular events and workshops, where you can meet other users, share your
              experiences, and learn from each other. These gatherings are crafted to create a sense
              of belonging and empower you to maximize your experience with us.
            </p>
            <p>
              We also want to highlight that your feedback is essential to our growth. We are
              continually working to enhance our services, and your insights play a crucial role in
              shaping our future developments. Whether it's a feature you adore or an area where you
              believe we can improve, we are eager to hear from you.
            </p>
            <p>
              Together, we can create a platform that not only meets your needs but also exceeds
              your expectations. Your voice matters, and we are here to listen. We believe that by
              working together, we can build a community that thrives on innovation and support.
            </p>
          </div>

          <div class="terms-mobile-cta">
            <wizz-button [fullWidth]="true" (clicked)="acceptTermsAndReturn()">I Agree</wizz-button>
          </div>
        </div>
      </div>
    } @else if (step() === 'success' || step() === 'pending') {
      <!-- Screen 04: Account Created Successfully / Account Created but Verification Pending -->
      <div class="status-screen">
        <header class="status-dark-bar">
          <wizz-brand-logo [light]="true" size="sm" />
        </header>

        <main class="status-center">
          <div class="green-circle">
            <wizz-icon name="check" [size]="28" [strokeWidth]="3" />
          </div>
          @if (step() === 'success') {
            <h2>Account Created Successfully</h2>
            <p>Your account has been created. Now you can login to your Paygate account.</p>
          } @else {
            <h2>Account Created but Verification Pending</h2>
            <p>
              Your account has been created without verification for now. You will need to complete
              this step after signing in.
            </p>
          }
          <wizz-button size="lg" [fullWidth]="true" (clicked)="goToLogin()">
            Continue to Login
          </wizz-button>
        </main>

        <footer class="status-footer">
          <a routerLink="/legal" [queryParams]="{ view: 'terms' }">Terms &amp; Conditions</a>
          <span>·</span>
          <a routerLink="/legal" [queryParams]="{ view: 'privacy' }">Privacy Policies</a>
          <span>·</span>
          <span>{{ theme.brand().version }}</span>
        </footer>
      </div>
    } @else {
      <!-- Split Screen Auth Shell (Screens 02, 03, 04) -->
      <wizz-auth-split-shell
        [backLabel]="step() === 'form' ? 'Go Back' : 'Back To Home'"
        [altPromptText]="step() === 'profile-type' ? 'Have an account?' : ''"
        [altActionLabel]="step() === 'profile-type' ? 'Sign In' : 'Sign In Now'"
        (backClicked)="handleBack()"
        (altActionClicked)="goToLogin()"
      >
        @if (step() === 'profile-type') {
          <app-signup-profile-type-step
            (individualSelected)="step.set('form')"
            (faqRequested)="activeModal.set('faq')"
          />
        } @else {
          <app-individual-signup-form
            [brandName]="theme.brandName()"
            [(firstName)]="firstName"
            [(middleName)]="middleName"
            [(lastName)]="lastName"
            [(email)]="email"
            [(dialCode)]="dialCode"
            [(phone)]="phone"
            [(nationality)]="nationality"
            [(dob)]="dob"
            [(password)]="password"
            [(confirmPassword)]="confirmPassword"
            [(agreedTerms)]="agreedTerms"
            [submitted]="submitted()"
            [emailError]="emailError()"
            [passwordError]="passwordError()"
            [confirmPasswordError]="confirmPasswordError()"
            (registrationSubmitted)="submitRegistration()"
            (termsRequested)="step.set('terms')"
          />
        }
      </wizz-auth-split-shell>
    }

    <!-- 02 Error: Age Requirement Modal -->
    <wizz-modal
      [open]="activeModal() === 'age-error'"
      tone="warning"
      title="You Don't Meet Our Age Requirements"
      subtitle="You must be 18 years or older to use this service."
      (closed)="activeModal.set(null)"
    >
      <wizz-button [fullWidth]="true" (clicked)="activeModal.set(null)">Got It</wizz-button>
    </wizz-modal>

    <!-- 02 Error: Something Went Wrong Modal -->
    <wizz-modal
      [open]="activeModal() === 'system-error'"
      tone="warning"
      title="Something Went Wrong"
      subtitle="Unable to submit right now, please retry."
      [showSupportFooter]="true"
      (closed)="activeModal.set(null)"
    >
      <wizz-button [fullWidth]="true" (clicked)="activeModal.set(null)">Try Again</wizz-button>
    </wizz-modal>

    <!-- 03 Uniqueness 1: Account already exists -->
    <wizz-modal
      [open]="activeModal() === 'unique-exists'"
      tone="warning"
      title="An account already exists with this email/mobile"
      [showSupportFooter]="true"
      (closed)="activeModal.set(null)"
    >
      <div class="masked-grid">
        <div>
          <small>Email Address</small>
          <strong>{{ maskedEmail() }}</strong>
        </div>
        <div>
          <small>Mobile number</small>
          <strong>{{ maskedPhone() }}</strong>
        </div>
      </div>
      <wizz-button [fullWidth]="true" (clicked)="goToLogin()">Login Instead</wizz-button>
      <wizz-button variant="outline" [fullWidth]="true" (clicked)="activeModal.set(null)">
        Use Another Contact
      </wizz-button>
    </wizz-modal>

    <!-- 03 Uniqueness 2: Similar account found -->
    <wizz-modal
      [open]="activeModal() === 'unique-similar'"
      tone="warning"
      title="We found a similar account, Do you already have an account?"
      (closed)="activeModal.set(null)"
    >
      <div class="masked-grid">
        <div>
          <small>Email Address</small>
          <strong>{{ maskedEmail() }}</strong>
        </div>
        <div>
          <small>Mobile number</small>
          <strong>{{ maskedPhone() }}</strong>
        </div>
        <div>
          <small>Name</small>
          <strong>Aks*********vi</strong>
        </div>
        <div>
          <small>Date of Birth</small>
          <strong>15 May 2002</strong>
        </div>
        <div>
          <small>Nationality</small>
          <strong>Uni********ca</strong>
        </div>
      </div>
      <wizz-button [fullWidth]="true" (clicked)="goToLogin()">Yes, Log In</wizz-button>
      <wizz-button variant="outline" [fullWidth]="true" (clicked)="proceedToOtp()">
        No, Continue Sign up
      </wizz-button>
    </wizz-modal>

    <!-- 03 Uniqueness 3: Partner Linked Account -->
    <wizz-modal
      [open]="activeModal() === 'unique-partner'"
      tone="warning"
      title="You Already Have an Account With Partner MO*****T Linked With the Following Details"
      [showSupportFooter]="true"
      (closed)="activeModal.set(null)"
    >
      <div class="masked-grid">
        <div>
          <small>Email Address</small>
          <strong>{{ maskedEmail() }}</strong>
        </div>
        <div>
          <small>Mobile number</small>
          <strong>{{ maskedPhone() }}</strong>
        </div>
      </div>
      <wizz-button [fullWidth]="true" (clicked)="activeModal.set(null)">Go Back</wizz-button>
    </wizz-modal>

    <!-- 04 Verify Email & Phone OTP Modal -->
    <wizz-modal
      [open]="activeModal() === 'verify-otp'"
      align="left"
      title="Please verify your email and phone"
      [maxWidth]="460"
      (closed)="activeModal.set('otp-incomplete')"
    >
      <wizz-otp-field
        label="Email Verification Code"
        placeholder="Enter 6 digit Email Verification Code"
        [sentMessage]="
          'A code has been sent to <strong>' + (email() || 'ajay@gmail.com') + '</strong>'
        "
        [(value)]="emailOtp"
        [error]="emailOtpError()"
        (resend)="resendEmailCode()"
      />

      <wizz-otp-field
        label="Mobile Verification Code"
        placeholder="Enter 6 digit Mobile Verification Code"
        [sentMessage]="
          'A code has been sent to <strong>' +
          dialCode() +
          ' ' +
          (phone() || '(314) 232 1112') +
          '</strong>'
        "
        [(value)]="mobileOtp"
        [error]="mobileOtpError()"
        (resend)="resendSmsCode()"
      />

      <p class="otp-note">
        If you've entered the wrong phone number or email, you can go back and update them.
        <span class="demo-hint"
          >(Tip: enter any 6 digits e.g. 123456, or 000000 to test error)</span
        >
      </p>

      <wizz-button [fullWidth]="true" (clicked)="verifyOtpCodes()">
        Verify Email and Phone
      </wizz-button>
    </wizz-modal>

    <!-- 04 Error: Too Many Attempts -->
    <wizz-modal
      [open]="activeModal() === 'otp-too-many'"
      tone="warning"
      title="Too Many Attempts, Please Try Again"
      subtitle="You have exceeded the maximum verification attempts. Please try again later."
      (closed)="activeModal.set(null)"
    >
      <wizz-button [fullWidth]="true" (clicked)="activeModal.set('verify-otp')"
        >Try Again</wizz-button
      >
      <wizz-button variant="ghost" [fullWidth]="true" (clicked)="finishPartialVerification()">
        Continue Anyway
      </wizz-button>
    </wizz-modal>

    <!-- 04 Warning: Verification Not Completed -->
    <wizz-modal
      [open]="activeModal() === 'otp-incomplete'"
      tone="warning"
      title="Verification Not Completed"
      subtitle="Please complete your verification process to get full access to features across PayGate."
      (closed)="activeModal.set(null)"
    >
      <wizz-button [fullWidth]="true" (clicked)="activeModal.set('verify-otp')">
        Complete Verification
      </wizz-button>
      <wizz-button variant="ghost" [fullWidth]="true" (clicked)="finishPartialVerification()">
        Continue Anyway
      </wizz-button>
    </wizz-modal>

    <!-- FAQ Modal -->
    <wizz-modal
      [open]="activeModal() === 'faq'"
      tone="info"
      title="Individual vs Organization Account"
      subtitle="Choose Individual if you are a freelancer, remote worker, or sending personal remittances. Choose Organization if you are registering an incorporated legal entity."
      (closed)="activeModal.set(null)"
    >
      <wizz-button [fullWidth]="true" (clicked)="activeModal.set(null)">Got It</wizz-button>
    </wizz-modal>
  `,
  styles: [
    `
      /* Uniqueness Masked Details Grid */
      .masked-grid {
        background: var(--wizz-surface-muted);
        border-radius: 12px;
        padding: 14px 16px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        text-align: left;
      }
      .masked-grid small {
        display: block;
        font-size: 0.7rem;
        color: var(--wizz-text-muted);
        margin-bottom: 2px;
      }
      .masked-grid strong {
        font-size: 0.82rem;
        color: var(--wizz-text);
      }
      .otp-note {
        margin: 2px 0;
        font-size: 0.76rem;
        line-height: 1.45;
        color: var(--wizz-text-secondary);
      }
      .demo-hint {
        display: block;
        margin-top: 4px;
        color: var(--wizz-primary);
        font-weight: 500;
      }

      /* Terms View */
      .terms-standalone {
        min-height: 100vh;
        background: #ffffff;
        padding: 36px 24px 64px;
      }
      .terms-container {
        max-width: 780px;
        margin: 0 auto;
      }
      .terms-brand {
        margin-bottom: 26px;
      }
      .terms-top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 10px;
      }
      .back-heading {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        padding: 0;
        font-size: 1.25rem;
        font-weight: 700;
        cursor: pointer;
        color: var(--wizz-text);
      }
      .updated-date {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--wizz-text);
        margin: 0 0 22px;
      }
      .terms-prose p {
        font-size: 0.88rem;
        line-height: 1.7;
        color: var(--wizz-text-secondary);
        margin: 0 0 18px;
      }
      .terms-mobile-cta {
        display: none;
        margin-top: 24px;
      }

      /* Account Created Status Screen */
      .status-screen {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: #ffffff;
      }
      .status-dark-bar {
        height: 56px;
        background: var(--wizz-navbar-bg);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .status-center {
        max-width: 380px;
        margin: 0 auto;
        padding: 32px 20px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .green-circle {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--wizz-green);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 6px;
      }
      .status-center h2 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 700;
      }
      .status-center p {
        margin: 0 0 12px;
        font-size: 0.84rem;
        line-height: 1.55;
        color: var(--wizz-text-secondary);
      }
      .status-footer {
        padding: 20px;
        display: flex;
        justify-content: center;
        gap: 10px;
        font-size: 0.75rem;
        color: var(--wizz-text-muted);
      }
      .status-footer a {
        color: var(--wizz-text-muted);
      }

      @media (max-width: 959px) {
        .mobile-signin-prompt {
          display: block;
        }
      }
      @media (max-width: 640px) {
        .masked-grid {
          grid-template-columns: 1fr;
        }
        .terms-mobile-cta {
          display: block;
        }
      }
    `,
  ],
})
export class SignupPageComponent {
  protected readonly theme = inject(ThemeService);
  private readonly store = inject(WizzPlatformStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly step = signal<SignupStep>('profile-type');
  readonly activeModal = signal<SignupModalKind>(null);
  readonly submitted = signal(false);

  // Parent-owned signal models persist while the individual form is mounted/unmounted.
  readonly firstName = signal('');
  readonly middleName = signal('');
  readonly lastName = signal('');
  readonly email = signal('');
  readonly dialCode = signal('+1');
  readonly phone = signal('');
  readonly nationality = signal('');
  readonly dob = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly agreedTerms = signal(false);

  // OTP Signals
  readonly emailOtp = signal('');
  readonly mobileOtp = signal('');
  readonly otpAttempts = signal(0);
  readonly emailOtpError = signal('');
  readonly mobileOtpError = signal('');

  readonly maskedEmail = computed(() => maskEmail(this.email() || 'ajay@gmail.com'));
  readonly maskedPhone = computed(() => maskPhone(this.phone() || '012918000000'));

  readonly emailError = computed(() => {
    if (!this.submitted()) return '';
    if (!isValidEmail(this.email())) return 'Please enter a valid email address';
    return '';
  });

  readonly passwordError = computed(() => {
    if (!this.submitted()) return '';
    const res = validateStrongPassword(this.password());
    return res.isValid
      ? ''
      : 'Password must be at least 12 characters with uppercase, lowercase, number, and symbol';
  });

  readonly confirmPasswordError = computed(() => {
    if (!this.submitted()) return '';
    return this.password() !== this.confirmPassword()
      ? 'Passwords do not match. Please re-enter'
      : '';
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const demo = params.get('demo');
      if (demo === 'uniqueness') {
        this.step.set('form');
        this.activeModal.set('unique-exists');
      } else if (demo === 'verify') {
        this.step.set('form');
        this.activeModal.set('verify-otp');
      }
    });
  }

  handleBack(): void {
    if (this.step() === 'form') {
      this.step.set('profile-type');
    } else {
      this.router.navigate(['/']);
    }
  }

  acceptTermsAndReturn(): void {
    this.agreedTerms.set(true);
    this.step.set('form');
  }

  submitRegistration(): void {
    this.submitted.set(true);
    if (
      !this.firstName().trim() ||
      !this.lastName().trim() ||
      !isValidEmail(this.email()) ||
      this.phone().trim().length < 7 ||
      !this.nationality() ||
      !this.dob() ||
      !validateStrongPassword(this.password()).isValid ||
      this.password() !== this.confirmPassword() ||
      !this.agreedTerms()
    ) {
      return;
    }

    if (!isAdult(this.dob(), 18)) {
      this.activeModal.set('age-error');
      return;
    }

    const lower = this.email().toLowerCase();
    if (lower.includes('exists')) {
      this.activeModal.set('unique-exists');
      return;
    }
    if (lower.includes('similar')) {
      this.activeModal.set('unique-similar');
      return;
    }
    if (lower.includes('partner')) {
      this.activeModal.set('unique-partner');
      return;
    }

    this.proceedToOtp();
  }

  proceedToOtp(): void {
    this.store.registerIndividual({
      firstName: this.firstName().trim(),
      middleName: this.middleName().trim(),
      lastName: this.lastName().trim(),
      email: this.email().trim(),
      dialCode: this.dialCode(),
      phone: this.phone().trim(),
      nationality: this.nationality(),
      dob: this.dob(),
    });
    this.emailOtpError.set('');
    this.mobileOtpError.set('');
    this.activeModal.set('verify-otp');
  }

  resendEmailCode(): void {
    this.toast.show('A new email code has been sent', 'success');
  }

  resendSmsCode(): void {
    this.toast.show('A new SMS code has been sent', 'success');
  }

  verifyOtpCodes(): void {
    this.emailOtpError.set('');
    this.mobileOtpError.set('');

    if (this.emailOtp() === '000000' || this.mobileOtp() === '000000') {
      this.otpAttempts.update((n) => n + 1);
      if (this.otpAttempts() >= 3) {
        this.activeModal.set('otp-too-many');
        return;
      }
      if (this.emailOtp() === '000000') {
        this.emailOtpError.set('The Email Verification Code you entered is invalid');
      }
      if (this.mobileOtp() === '000000') {
        this.mobileOtpError.set('The Mobile Verification Code you entered is invalid');
      }
      return;
    }

    const emailOk = this.emailOtp().length === 6;
    const mobileOk = this.mobileOtp().length === 6;

    if (!emailOk && !mobileOk) {
      this.emailOtpError.set('Please enter the 6-digit email verification code');
      this.mobileOtpError.set('Please enter the 6-digit mobile verification code');
      return;
    }

    this.store.markContactVerified(emailOk, mobileOk);
    this.activeModal.set(null);

    if (emailOk && mobileOk) {
      this.step.set('success');
    } else {
      this.step.set('pending');
    }
  }

  finishPartialVerification(): void {
    this.activeModal.set(null);
    this.step.set('pending');
  }

  goToLogin(): void {
    this.activeModal.set(null);
    this.router.navigate(['/auth/login']);
  }
}
