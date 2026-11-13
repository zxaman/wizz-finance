import { Component } from '@angular/core';
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
  selector: 'app-login-page',
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
        <wizz-brand-logo [brand]="'partner'" />
        <div class="promo-content">
          <h2>Local Accounts in Global Currencies</h2>
          <p>Partner-branded white-label remittance portal for your clients.</p>
          <img src="/assets/auth-promo.jpg" alt="Partner Promo" class="promo-img" />
        </div>
      </div>

      <div class="auth-split-right">
        <wizz-focused-flow-shell title="Partner Login">
          <!-- Screen 05: Email & Password Login -->
          @if (mode() === 'email') {
            <div class="form-stack">
              <wizz-input label="Email" type="email" placeholder="partner@example.com" [(value)]="email" />
              <wizz-input label="Password" type="password" [(value)]="password" />

              <div class="actions-row">
                <a routerLink="/auth/forgot-password" class="link">Forgot Password?</a>
                <wizz-button [fullWidth]="true" (clicked)="login()">
                  Login
                </wizz-button>
              </div>

              <div class="social-divider">
                <span>Or continue with</span>
              </div>

              <div class="social-grid">
                <button type="button" class="social-btn" (click)="socialLogin('google')">
                  <wizz-icon name="google" [size]="18" /> Google
                </button>
                <button type="button" class="social-btn" (click)="socialLogin('apple')">
                  <wizz-icon name="apple" [size]="18" /> Apple
                </button>
              </div>
            </div>
          }

          <!-- Screen 07: Social Login & MFA (Screen 07) -->
          @if (mode() === 'social') {
            <div class="form-stack">
              <p class="status-text">Authenticating with {{ socialProvider() }}...</p>
              <wizz-button variant="outline" [fullWidth]="true" (clicked)="mode.set('email')">
                Use Email Login
              </wizz-button>
            </div>
          }

          <!-- Screen 07: MFA Prompt -->
          @if (mode() === 'mfa') {
            <div class="form-stack">
              <h3>Enter 6-Digit Code</h3>
              <p class="sub">Sent to your registered device</p>
              <wizz-input label="MFA Code" type="password" [(value)]="mfaCode" />
              <wizz-button [fullWidth]="true" (clicked)="completeLogin()">
                Verify &amp; Login
              </wizz-button>
            </div>
          }

          <!-- Screen 07: Lockout Timer -->
          @if (mode() === 'lockout') {
            <div class="lockout-stack">
              <wizz-icon name="alert-triangle" [size]="48" class="lockout-icon" />
              <h2>Account Locked</h2>
              <p class="sub">Too many failed attempts. Try again in {{ lockoutTimer() }}s</p>
              <wizz-button variant="outline" [fullWidth]="true" (clicked)="resetLockout()">
                Reset Timer
              </wizz-button>
            </div>
          }
        </wizz-focused-flow-shell>
      </div>
    </wizz-auth-split-shell>

    <!-- Lockout Error Modal -->
    <wizz-modal [open]="modalType() === 'lockout'" title="Account Locked" (closed)="modalType.set(null)">
      <p>Your account has been temporarily locked due to security reasons.</p>
      <div drawer-footer>
        <wizz-button [fullWidth]="true" (clicked)="modalType.set(null)">
          Got It
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
      .lockout-stack {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .actions-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .link {
        color: #7965f0;
        font-size: 0.8rem;
        text-decoration: none;
      }
      .social-divider {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 16px 0;
        font-size: 0.76rem;
        color: #64748b;
      }
      .social-divider::before,
      .social-divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #e2e8f0;
      }
      .social-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .social-btn {
        padding: 10px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 0.84rem;
        font-weight: 600;
        cursor: pointer;
      }

      .lockout-stack {
        text-align: center;
        padding: 20px 0;
      }
      .lockout-icon {
        color: #f5a623;
        margin-bottom: 16px;
      }
      .lockout-stack h2 {
        margin: 0 0 8px;
      }
      .lockout-stack .sub {
        margin: 0;
        color: #64748b;
      }
    `,
  ],
})
export class LoginPageComponent {
  readonly mode = signal<'email' | 'social' | 'mfa' | 'lockout'>('email');
  readonly modalType = signal<'lockout' | null>(null);

  readonly email = signal('');
  readonly password = signal('');
  readonly mfaCode = signal('');
  readonly socialProvider = signal('');
  readonly lockoutTimer = signal(878); // 00:14:38

  login(): void {
    // Mock MFA requirement
    this.mode.set('mfa');
  }

  socialLogin(provider: 'google' | 'apple'): void {
    this.socialProvider.set(provider);
    this.mode.set('social');
    // Mock lockout
    // this.mode.set('lockout');
    // this.modalType.set('lockout');
  }

  completeLogin(): void {
    if (this.mfaCode().length === 6) {
      // Success
    } else {
      this.mode.set('lockout');
      this.modalType.set('lockout');
    }
  }

  resetLockout(): void {
    this.lockoutTimer.set(878);
    this.mode.set('email');
  }
}
