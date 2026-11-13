import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { UiButtonComponent } from '@wizz/ui';

@Component({
  selector: 'partner-legal-information-page',
  standalone: true,
  imports: [RouterLink, UiButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="legal-page">
      <a routerLink="/dashboard" class="back-link">← Back to dashboard</a>
      <nav class="legal-tabs" aria-label="Legal documents">
        <button
          type="button"
          [class.active]="view() === 'terms'"
          [attr.aria-pressed]="view() === 'terms'"
          (click)="setView('terms')"
        >
          Terms &amp; Conditions
        </button>
        <button
          type="button"
          [class.active]="view() === 'privacy'"
          [attr.aria-pressed]="view() === 'privacy'"
          (click)="setView('privacy')"
        >
          Privacy Policy
        </button>
      </nav>
      @if (view() === 'terms') {
        <h1>Partner Terms &amp; Conditions</h1>
        <p>
          By using the Wizz partner portal, you agree to keep your organization and account
          information accurate, protect your credentials, and use the portal only for authorized
          business payments.
        </p>
        <h2>Payments and compliance</h2>
        <p>
          Transfer fees, exchange rates, delivery estimates, and verification requirements are shown
          for review before a payment is submitted. You are responsible for complying with
          applicable laws and providing requested due-diligence information.
        </p>
      } @else {
        <h1>Partner Privacy Policy</h1>
        <p>
          We use account, organization, and transaction information to provide the partner portal,
          verify authorized users, process payments, prevent fraud, and meet regulatory obligations.
        </p>
        <h2>Your information</h2>
        <p>
          We apply safeguards to protect information and restrict access to authorized operational,
          support, and compliance purposes. Contact partner support with privacy questions or to
          update your account details.
        </p>
      }
      <wizz-button variant="outline" (clicked)="goBack()">Return to the portal</wizz-button>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: #fff;
      }
      .legal-page {
        max-width: 820px;
        margin: 0 auto;
        padding: 28px 20px 48px;
      }
      .back-link {
        color: var(--wizz-primary);
      }
      .legal-tabs {
        display: flex;
        gap: 8px;
        margin: 36px 0 28px;
        border-bottom: 1px solid var(--wizz-border);
        overflow-x: auto;
      }
      .legal-tabs button {
        flex: 0 0 auto;
        padding: 12px;
        border: 0;
        border-bottom: 2px solid transparent;
        background: none;
        font: inherit;
        cursor: pointer;
      }
      .legal-tabs button.active {
        border-color: var(--wizz-primary);
        color: var(--wizz-primary);
      }
      h1 {
        font-size: clamp(1.6rem, 4vw, 2.2rem);
      }
      p {
        color: var(--wizz-text-secondary);
        line-height: 1.7;
      }
      h2 {
        margin-top: 28px;
        font-size: 1.1rem;
      }
    `,
  ],
})
export class PartnerLegalInformationPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly view = signal<'terms' | 'privacy'>('terms');

  constructor() {
    this.route.queryParamMap.subscribe((params) =>
      this.view.set(params.get('view') === 'privacy' ? 'privacy' : 'terms'),
    );
  }

  setView(view: 'terms' | 'privacy'): void {
    this.view.set(view);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view },
      queryParamsHandling: 'merge',
    });
  }

  goBack(): void {
    void this.router.navigate(['/dashboard']);
  }
}
