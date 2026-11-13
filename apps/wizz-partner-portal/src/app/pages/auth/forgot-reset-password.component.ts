import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AuthSplitShellComponent,
  FocusedFlowShellComponent,
} from '@wizz/remittance-shell';
import {
  BrandLogoComponent,
  UiButtonComponent,
  UiDrawerComponent,
  UiInputComponent,
  UiModalComponent,
  WizzIconComponent,
} from '@wizz/ui';

@Component({
  selector: 'app-forgot-reset-password-page',
  standalone: true,
  imports: [
    RouterLink,
    AuthSplitShellComponent,
    FocusedFlowShellComponent,
    BrandLogoComponent,
    UiButtonComponent,
    UiDrawerComponent,
    UiInputComponent,
    UiModalComponent,
    WizzIconComponent,
  ],
  template: `
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
        <wizz-focused-flow-shell [title]="step() === 0 ? 'Forgot Password' : 'Create New Password'">
          <!-- Screen 09: Forgot Password Request & Check Email -->
          @if (step() === 0) {
            <div class="form-stack">
              <wizz-input label="Email" type="email" placeholder="partner@example.com" [(value)]="email" />
              <wizz-button [fullWidth]="true" (clicked)="requestReset()">
                Send Reset Link
              </wizz-button>
            </div>

            @if (emailSent()) {
              <div class="check-email-box">
              <wizz-icon name="mail" [size]="48" class="mail-icon" />
              <h3>Check Your Email</h3>
              <p class="sub">We've sent a reset link to {{ email() }}</p>
              <div class="shortcuts">
                <button type="button" class="shortcut-btn" (click)="openMail('gmail')">
                  <wizz-icon name="globe" [size]="16" /> Open Gmail
                </button>
                <button type="button" class="shortcut-btn" (click)="openMail('outlook')">
                  <wizz-icon name="mail" [size]="16" /> Open Outlook
                </button>
              </div>
              <div class="timer-row">
                <span>Resend in: {{ resendTimer() }}s</span>
                <button type="button" class="link" [disabled]="resendTimer() > 0" (click)="resetTimer()">
                  Resend Link
                </button>
              </div>
              </div>
            }
          }

          <!-- Screen 10: Create New Password -->
          @if (step() === 1) {
            <div class="form-stack">
              <h3>Create New Password</h3>
              <wizz-input label="New Password" type="password" [(value)]="newPassword" />
              <wizz-input label="Confirm Password" type="password" [(value)]="confirmPassword" />
              <wizz-button [fullWidth]="true" (clicked)="resetPassword()">
                Reset Password
              </wizz-button>
            </div>
          }

          <!-- Screen 10: Password Changed Modal -->
          @if (step() === 2) {
            <div class="success-stack">
              <wizz-icon name="check-circle" [size]="64" class="success-icon" />
              <h2>Password Changed</h2>
              <p class="sub">Your password has been successfully updated.</p>
              <wizz-button [fullWidth]="true" (clicked)="go('/auth/login')">
                Login Now
              </wizz-button>
            </div>
          }
        </wizz-focused-flow-shell>
      </div>
    </wizz-auth-split-shell>

    <!-- Link Expired Modal (Screen 10) -->
    <wizz-modal [open]="modalType() === 'expired'" title="Link Expired" (closed)="modalType.set(null)">
      <p>The password reset link has expired. Please request a new one.</p>
      <div drawer-footer>
        <wizz-button [fullWidth]="true" (clicked)="modalType.set(null); step.set(0)">
          Request New Link
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
      .success-stack,
      .check-email-box {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .mail-icon {
        color: #7965f0;
        margin-bottom: 16px;
      }
      .shortcuts {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 12px 0;
      }
      .shortcut-btn {
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        cursor: pointer;
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
    `,
  ],
})
export class ForgotResetPasswordPageComponent {
  readonly step = signal(0);
  readonly modalType = signal<'expired' | null>(null);

  readonly email = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly emailSent = signal(false);
  readonly resendTimer = signal(60);

  requestReset(): void {
    if (this.email()) {
      this.emailSent.set(true);
      this.step.set(0);
      this.resetTimer();
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

  openMail(service: 'gmail' | 'outlook'): void {
    // Mock opening mail
  }

  resetPassword(): void {
    if (this.newPassword() === this.confirmPassword() && this.newPassword().length >= 8) {
      this.step.set(2);
    } else {
      // Mock error
    }
  }

  go(path: string): void {
    // In a real app, use router.navigate
  }
}
