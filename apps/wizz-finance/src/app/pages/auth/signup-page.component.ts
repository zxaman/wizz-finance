import {
  ChangeDetectionStrategy,
  Component,
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
  BrandLogoComponent,
  SelectOption,
  ToastService,
  UiBadgeComponent,
  UiButtonComponent,
  UiInputComponent,
  UiModalComponent,
  UiOtpFieldComponent,
  UiPhoneInputComponent,
  UiSelectComponent,
  WizzIconComponent,
} from '@wizz/ui';
import {
  COUNTRIES,
  isAdult,
  isValidEmail,
  maskEmail,
  maskPhone,
  validateStrongPassword,
} from '@wizz/utils';

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
    FormsModule,
    RouterLink,
    AuthSplitShellComponent,
    BrandLogoComponent,
    UiButtonComponent,
    UiInputComponent,
    UiSelectComponent,
    UiPhoneInputComponent,
    UiOtpFieldComponent,
    UiBadgeComponent,
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
          <a routerLink="/terms">Terms &amp; Conditions</a>
          <span>·</span>
          <a routerLink="/terms">Privacy Policies</a>
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
          <!-- Screen 02a: Choose Your Profile Type -->
          <div class="profile-type-box">
            <h1>Choose Your Profile Type</h1>
            <p class="lead">
              Selecting your profile type helps us unlock the most relevant tools, documents, and
              compliance checks for you.
            </p>

            <div class="type-cards">
              <button type="button" class="type-card type-card--active" (click)="step.set('form')">
                <div class="type-icon">
                  <wizz-icon name="user" [size]="20" />
                </div>
                <h3>Individual</h3>
                <p>For solo professionals and anyone sending or receiving money globally</p>
              </button>

              <div class="type-card type-card--disabled">
                <div class="type-top-row">
                  <div class="type-icon type-icon--muted">
                    <wizz-icon name="building-2" [size]="20" />
                  </div>
                  <wizz-badge tone="coming-soon">Coming Soon</wizz-badge>
                </div>
                <h3>Organization</h3>
                <p>Registered company or entity receiving cross-border payments</p>
              </div>
            </div>

            <p class="faq-note">
              Not sure what category you fall in?
              <button type="button" class="wizz-link" (click)="activeModal.set('faq')">
                Refer our FAQs
              </button>
            </p>
          </div>
        } @else {
          <!-- Screen 02b: Sign up on Paygate Form -->
          <form class="signup-form" (ngSubmit)="submitRegistration()">
            <div class="form-head-row">
              <h1>Sign up on {{ theme.brandName() }}</h1>
              <button
                type="button"
                class="demo-chip"
                (click)="showScenarioBar.update(v => !v)"
                title="Test Figma 02, 03, 04 states"
              >
                <wizz-icon name="sparkles" [size]="13" />
                <span>States</span>
              </button>
            </div>

            @if (showScenarioBar()) {
              <div class="scenario-strip">
                <span class="scenario-label">Test Figma Flows (02–04):</span>
                <div class="scenario-btns">
                  <button type="button" (click)="activeModal.set('unique-exists')">
                    03: Account Exists
                  </button>
                  <button type="button" (click)="activeModal.set('unique-similar')">
                    03: Similar Account
                  </button>
                  <button type="button" (click)="activeModal.set('unique-partner')">
                    03: Partner Linked
                  </button>
                  <button type="button" (click)="activeModal.set('verify-otp')">
                    04: Verify OTP
                  </button>
                  <button type="button" (click)="activeModal.set('age-error')">
                    02: Under-18 Error
                  </button>
                </div>
              </div>
            }

            <wizz-input
              label="First Name"
              placeholder="Enter First Name"
              [(value)]="firstName"
              [error]="submitted() && !firstName().trim() ? 'First name is required' : ''"
            />

            <div class="two-col">
              <wizz-input
                label="Middle Name"
                placeholder="Enter Middle Name"
                [(value)]="middleName"
              />
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
              placeholder="ajay@gmail.com"
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
              hint="Use a strong password of at least 12 characters with a mix of uppercase, lowercase, numbers, and symbols"
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
              <input type="checkbox" [ngModel]="agreedTerms()" (ngModelChange)="agreedTerms.set($event)" name="agreedTerms" />
              <span>
                I agree with
                <button type="button" class="wizz-link" (click)="step.set('terms')">
                  Privacy Policy
                </button>
                and
                <button type="button" class="wizz-link" (click)="step.set('terms')">
                  Terms &amp; Conditions
                </button>
              </span>
            </label>
            @if (submitted() && !agreedTerms()) {
              <p class="inline-err">Please accept the Privacy Policy and Terms &amp; Conditions</p>
            }

            <wizz-button type="submit" size="lg" [fullWidth]="true">
              Finish Registration
            </wizz-button>

            <p class="mobile-signin-prompt">
              Have an account?
              <button type="button" class="wizz-link" (click)="goToLogin()">Login</button>
            </p>
          </form>
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
        [sentMessage]="'A code has been sent to <strong>' + (email() || 'ajay@gmail.com') + '</strong>'"
        [(value)]="emailOtp"
        [error]="emailOtpError()"
        (resend)="resendEmailCode()"
      />

      <wizz-otp-field
        label="Mobile Verification Code"
        placeholder="Enter 6 digit Mobile Verification Code"
        [sentMessage]="'A code has been sent to <strong>' + dialCode() + ' ' + (phone() || '(314) 232 1112') + '</strong>'"
        [(value)]="mobileOtp"
        [error]="mobileOtpError()"
        (resend)="resendSmsCode()"
      />

      <p class="otp-note">
        If you've entered the wrong phone number or email, you can go back and update them.
        <span class="demo-hint">(Tip: enter any 6 digits e.g. 123456, or 000000 to test error)</span>
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
      <wizz-button [fullWidth]="true" (clicked)="activeModal.set('verify-otp')">Try Again</wizz-button>
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
      .profile-type-box h1,
      .signup-form h1 {
        margin: 0 0 8px;
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--wizz-text);
      }
      .lead {
        margin: 0 0 24px;
        font-size: 0.85rem;
        line-height: 1.55;
        color: var(--wizz-text-secondary);
      }
      .type-cards {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
        margin-bottom: 20px;
      }
      .type-card {
        text-align: left;
        padding: 18px 16px;
        border-radius: 14px;
        border: 1.5px solid var(--wizz-border);
        background: #ffffff;
        display: flex;
        flex-direction: column;
        gap: 8px;
        transition: all 0.16s ease;
      }
      .type-card--active {
        cursor: pointer;
        border-color: var(--wizz-primary-border);
      }
      .type-card--active:hover {
        border-color: var(--wizz-primary);
        background: var(--wizz-primary-soft);
        transform: translateY(-2px);
      }
      .type-card--disabled {
        opacity: 0.72;
        background: #fafbfe;
      }
      .type-top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .type-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: var(--wizz-primary-soft);
        color: var(--wizz-primary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .type-icon--muted {
        background: #eef0f6;
        color: var(--wizz-text-muted);
      }
      .type-card h3 {
        margin: 4px 0 0;
        font-size: 0.96rem;
        font-weight: 700;
        color: var(--wizz-text);
      }
      .type-card p {
        margin: 0;
        font-size: 0.76rem;
        line-height: 1.45;
        color: var(--wizz-text-secondary);
      }
      .faq-note {
        font-size: 0.8rem;
        color: var(--wizz-text-secondary);
      }

      .signup-form {
        display: flex;
        flex-direction: column;
        gap: 13px;
      }
      .form-head-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
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
      }
      .scenario-strip {
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

      .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .terms-check {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.78rem;
        color: var(--wizz-text-secondary);
        margin-top: 2px;
      }
      .terms-check input {
        width: 16px;
        height: 16px;
        accent-color: var(--wizz-primary);
      }
      .inline-err {
        margin: -6px 0 0;
        font-size: 0.75rem;
        color: var(--wizz-danger);
      }
      .mobile-signin-prompt {
        display: none;
        text-align: center;
        font-size: 0.82rem;
        color: var(--wizz-text-secondary);
        margin: 4px 0 0;
      }

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
        .type-cards,
        .two-col,
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

  protected readonly countryOptions: readonly SelectOption[] = COUNTRIES.map((c) => ({
    value: c.name,
    label: c.name,
    prefix: c.flag,
  }));

  readonly step = signal<SignupStep>('profile-type');
  readonly showScenarioBar = signal(false);
  readonly activeModal = signal<SignupModalKind>(null);
  readonly submitted = signal(false);

  // Form Signals
  readonly firstName = signal('Ajay');
  readonly middleName = signal('');
  readonly lastName = signal('Shekhawat');
  readonly email = signal('ajay@gmail.com');
  readonly dialCode = signal('+1');
  readonly phone = signal('3142321112');
  readonly nationality = signal('United States');
  readonly dob = signal('1998-05-15');
  readonly password = signal('Paygate@2026!');
  readonly confirmPassword = signal('Paygate@2026!');
  readonly agreedTerms = signal(true);

  // OTP Signals
  readonly emailOtp = signal('123456');
  readonly mobileOtp = signal('654321');
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
        this.showScenarioBar.set(true);
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
