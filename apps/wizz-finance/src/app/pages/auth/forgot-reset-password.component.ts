import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WizzPlatformStore } from '@wizz/remittance-data-access';
import { AuthSplitShellComponent } from '@wizz/remittance-shell';
import { ToastService, UiButtonComponent, UiInputComponent, UiModalComponent } from '@wizz/ui';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [AuthSplitShellComponent, UiButtonComponent, UiInputComponent, UiModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wizz-auth-split-shell>
      <div class="auth-stack">
        <h1>Forgot Password</h1>
        <p class="sub">Enter the email associated with your account to receive a reset link.</p>
        <wizz-input label="Email Address" type="email" [(value)]="email" />
        <wizz-button [fullWidth]="true" (clicked)="requestReset()">Send Reset Link</wizz-button>
      </div>
    </wizz-auth-split-shell>
    <wizz-modal
      [open]="showCheckEmail()"
      tone="info"
      title="Check Your Email"
      subtitle="We've sent a reset link to {{ email() }}. Open your inbox to continue."
      (closed)="showCheckEmail.set(false)"
    >
      <div class="check-email-stack">
        <div class="email-shortcuts">
          <button type="button" class="shortcut-btn" (click)="openInbox('gmail')">Open Gmail</button
          ><button type="button" class="shortcut-btn" (click)="openInbox('outlook')">
            Open Outlook
          </button>
        </div>
        <div class="resend-timer">
          <span>Resend link in:</span><strong>{{ resendSeconds() }}s</strong>
        </div>
      </div>
      <div drawer-footer>
        <wizz-button [fullWidth]="true" (clicked)="showCheckEmail.set(false)">Got It</wizz-button>
      </div>
    </wizz-modal>
    <wizz-modal
      [open]="showPasswordChanged()"
      tone="success"
      title="Password Changed"
      subtitle="Your password has been successfully updated. You can now log in."
      (closed)="showPasswordChanged.set(false)"
    >
      <div drawer-footer>
        <wizz-button
          [fullWidth]="true"
          (clicked)="showPasswordChanged.set(false); go('/auth/login')"
          >Log In Now</wizz-button
        >
      </div>
    </wizz-modal>
    <wizz-modal
      [open]="showLinkExpired()"
      tone="danger"
      title="Link Expired"
      subtitle="The password reset link has expired or is invalid. Please request a new one."
      (closed)="showLinkExpired.set(false)"
    >
      <div drawer-footer>
        <wizz-button [fullWidth]="true" (clicked)="showLinkExpired.set(false); requestReset()"
          >Request New Link</wizz-button
        >
      </div>
    </wizz-modal>
  `,
  styles: [
    `
      .auth-stack {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .auth-stack h1 {
        margin: 0;
        font-size: 1.45rem;
        font-weight: 800;
      }
      .sub {
        margin: 4px 0 0;
        font-size: 0.84rem;
        color: var(--wizz-text-secondary);
      }
      .check-email-stack {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .email-shortcuts {
        display: flex;
        gap: 10px;
      }
      .shortcut-btn {
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid var(--wizz-border);
        background: #ffffff;
        font-size: 0.8rem;
        cursor: pointer;
      }
      .resend-timer {
        font-size: 0.8rem;
        color: var(--wizz-text-muted);
        text-align: center;
      }
    `,
  ],
})
export class ForgotPasswordPageComponent {
  protected readonly store = inject(WizzPlatformStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly email = signal('');
  readonly showCheckEmail = signal(false);
  readonly showPasswordChanged = signal(false);
  readonly showLinkExpired = signal(false);
  readonly resendSeconds = signal(60);
  requestReset(): void {
    if (!this.email().trim()) {
      this.toast.show('Please enter your email address', 'warning');
      return;
    }
    this.showCheckEmail.set(true);
    const timer = setInterval(() => {
      if (this.resendSeconds() > 0) this.resendSeconds.update((s) => s - 1);
      else {
        clearInterval(timer);
        this.resendSeconds.set(60);
      }
    }, 1000);
  }
  openInbox(provider: 'gmail' | 'outlook'): void {
    const inboxUrl =
      provider === 'gmail'
        ? 'https://mail.google.com/mail/u/0/#inbox'
        : 'https://outlook.live.com/mail/0/inbox';
    if (typeof window !== 'undefined') {
      window.open(inboxUrl, '_blank', 'noopener,noreferrer');
    }
    this.toast.show(
      `Opening ${provider.charAt(0).toUpperCase() + provider.slice(1)} inbox...`,
      'info',
    );
  }
  go(path: string): void {
    this.router.navigate([path]);
  }
}

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [AuthSplitShellComponent, UiButtonComponent, UiInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wizz-auth-split-shell>
      <div class="auth-stack">
        <h1>Create New Password</h1>
        <p class="sub">Set a new password for your account. Must be at least 12 characters.</p>
        <wizz-input label="New Password" type="password" [(value)]="newPassword" />
        <wizz-input label="Confirm Password" type="password" [(value)]="confirmPassword" />
        <wizz-button [fullWidth]="true" (clicked)="resetPassword()">Reset Password</wizz-button>
      </div>
    </wizz-auth-split-shell>
  `,
  styles: [
    `
      .auth-stack {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .auth-stack h1 {
        margin: 0;
        font-size: 1.45rem;
        font-weight: 800;
      }
      .sub {
        margin: 4px 0 0;
        font-size: 0.84rem;
        color: var(--wizz-text-secondary);
      }
    `,
  ],
})
export class ResetPasswordPageComponent {
  protected readonly store = inject(WizzPlatformStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  resetPassword(): void {
    if (this.newPassword() !== this.confirmPassword()) {
      this.toast.show('Passwords do not match', 'warning');
      return;
    }
    if (this.newPassword().length < 12) {
      this.toast.show('Password must be at least 12 characters', 'warning');
      return;
    }
    this.toast.show('Password reset successfully', 'success');
    this.router.navigate(['/auth/login']);
  }
}
