import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ThemeService } from '@wizz/design-tokens';
import { BrandLogoComponent, UiButtonComponent } from '@wizz/ui';

type LegalView = 'terms' | 'privacy';

@Component({
  selector: 'app-legal-information-page',
  standalone: true,
  imports: [RouterLink, BrandLogoComponent, UiButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="legal-page">
      <header class="legal-header">
        <a routerLink="/" aria-label="Paygate home"><wizz-brand-logo /></a>
        <wizz-button variant="outline" size="sm" (clicked)="goHome()">Back to Home</wizz-button>
      </header>

      <main class="legal-content">
        <nav class="legal-tabs" aria-label="Legal documents">
          <button
            type="button"
            [class.is-active]="view() === 'terms'"
            [attr.aria-pressed]="view() === 'terms'"
            (click)="setView('terms')"
          >
            Terms &amp; Conditions
          </button>
          <button
            type="button"
            [class.is-active]="view() === 'privacy'"
            [attr.aria-pressed]="view() === 'privacy'"
            (click)="setView('privacy')"
          >
            Privacy Policy
          </button>
        </nav>

        @if (view() === 'terms') {
          <h1>Terms &amp; Conditions</h1>
          <p class="last-updated">Last updated {{ theme.brand().lastTermsUpdate }}</p>
          <section class="legal-prose">
            <h2>Using Paygate</h2>
            <p>
              By creating an account or using Paygate, you agree to provide accurate information,
              protect your sign-in credentials, and use the service only for lawful payments.
            </p>
            <h2>Payments and verification</h2>
            <p>
              Payment availability, delivery times, fees, and exchange rates depend on the selected
              corridor and will be shown for review before you authorize a transfer. Identity and
              payment-method verification may be required.
            </p>
            <h2>Keeping your account safe</h2>
            <p>
              Keep your contact details current and tell us promptly if you suspect unauthorized
              access. We may pause activity while we review unusual transactions or meet legal
              obligations.
            </p>
            <h2>Support</h2>
            <p>
              For help with an account or transfer, contact
              <a [href]="'mailto:' + theme.brand().supportEmail">{{
                theme.brand().supportEmail
              }}</a>.
            </p>
          </section>
        } @else {
          <h1>Privacy Policy</h1>
          <p class="last-updated">Last updated {{ theme.brand().lastTermsUpdate }}</p>
          <section class="legal-prose">
            <h2>Information we use</h2>
            <p>
              We use the information you provide to create and secure your account, verify identity,
              process transfers, prevent fraud, and provide customer support.
            </p>
            <h2>How information is protected</h2>
            <p>
              We apply technical and organizational safeguards to protect personal and financial
              information. Access is limited to authorized service operations and legal or
              compliance needs.
            </p>
            <h2>Your choices</h2>
            <p>
              You can review and update account details in your profile, manage notification
              preferences, and contact support with questions about your information.
            </p>
            <h2>Contact</h2>
            <p>
              Privacy questions can be sent to
              <a [href]="'mailto:' + theme.brand().supportEmail">{{
                theme.brand().supportEmail
              }}</a>.
            </p>
          </section>
        }

        <footer class="legal-actions">
          <wizz-button variant="outline" (clicked)="goHome()">Return to Paygate</wizz-button>
          <wizz-button (clicked)="goToSignup()">Create an Account</wizz-button>
        </footer>
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: #fff;
      }
      .legal-page {
        min-height: 100vh;
        padding: 20px clamp(16px, 4vw, 48px) 40px;
      }
      .legal-header {
        max-width: 1180px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .legal-header > a {
        display: inline-flex;
        min-width: 0;
      }
      .legal-content {
        max-width: 820px;
        margin: 52px auto 0;
      }
      .legal-tabs {
        display: flex;
        gap: 8px;
        border-bottom: 1px solid var(--wizz-border);
        margin-bottom: 28px;
        overflow-x: auto;
      }
      .legal-tabs button {
        flex: 0 0 auto;
        padding: 12px 16px;
        border: 0;
        border-bottom: 2px solid transparent;
        background: none;
        color: var(--wizz-text-secondary);
        font: inherit;
        font-weight: 600;
        cursor: pointer;
      }
      .legal-tabs button.is-active {
        border-bottom-color: var(--wizz-primary);
        color: var(--wizz-primary);
      }
      .legal-tabs button:focus-visible,
      .legal-header a:focus-visible {
        outline: 2px solid var(--wizz-primary);
        outline-offset: 3px;
      }
      h1 {
        margin: 0 0 8px;
        font-size: clamp(1.7rem, 4vw, 2.35rem);
        line-height: 1.15;
      }
      .last-updated {
        margin: 0 0 28px;
        color: var(--wizz-text-secondary);
        font-size: 0.86rem;
      }
      .legal-prose h2 {
        margin: 24px 0 8px;
        font-size: 1.08rem;
      }
      .legal-prose p {
        margin: 0 0 16px;
        color: var(--wizz-text-secondary);
        font-size: 0.93rem;
        line-height: 1.7;
      }
      .legal-prose a {
        color: var(--wizz-primary);
        overflow-wrap: anywhere;
      }
      .legal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 36px;
      }
      @media (max-width: 600px) {
        .legal-page {
          padding: 14px 16px 28px;
        }
        .legal-content {
          margin-top: 32px;
        }
        .legal-tabs button {
          padding: 10px 12px;
          font-size: 0.83rem;
        }
        .legal-prose p {
          font-size: 0.88rem;
        }
        .legal-actions {
          display: grid;
          grid-template-columns: 1fr;
        }
        .legal-actions wizz-button {
          width: 100%;
        }
      }
    `,
  ],
})
export class LegalInformationPageComponent {
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly view = signal<LegalView>('terms');

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.view.set(params.get('view') === 'privacy' ? 'privacy' : 'terms');
    });
  }

  setView(view: LegalView): void {
    this.view.set(view);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view },
      queryParamsHandling: 'merge',
    });
  }

  goHome(): void {
    void this.router.navigate(['/']);
  }
  goToSignup(): void {
    void this.router.navigate(['/auth/signup']);
  }
}
