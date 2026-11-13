import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '@wizz/design-tokens';
import {
  BrandLogoComponent,
  UiBadgeComponent,
  UiButtonComponent,
  UiModalComponent,
  WizzIconComponent,
} from '@wizz/ui';
import { COUNTRIES, LANDING_COVERAGE_COUNTRIES } from '@wizz/utils';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    RouterLink,
    BrandLogoComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiModalComponent,
    WizzIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="landing-page">
      <!-- Top Navigation Bar -->
      <header class="landing-header">
        <div class="header-inner">
          <a routerLink="/" class="brand-anchor">
            <wizz-brand-logo />
          </a>

          <div class="header-actions">
            <div class="company-menu-wrap">
              <button
                type="button"
                class="company-trigger"
                [attr.aria-expanded]="companyMenuOpen()"
                aria-haspopup="true"
                (click)="companyMenuOpen.update((v) => !v)"
              >
                <span>Company</span>
                <wizz-icon name="chevron-down" [size]="15" />
              </button>

              @if (companyMenuOpen()) {
                <div class="company-dropdown" (mouseleave)="companyMenuOpen.set(false)">
                  <a href="#coverage" class="drop-link" (click)="companyMenuOpen.set(false)">
                    <wizz-icon name="globe" [size]="15" /> Global Coverage
                  </a>
                  <a href="#security" class="drop-link" (click)="companyMenuOpen.set(false)">
                    <wizz-icon name="shield-check" [size]="15" /> Security &amp; Compliance
                  </a>
                  <a
                    routerLink="/auth/signup"
                    class="drop-link"
                    (click)="companyMenuOpen.set(false)"
                  >
                    <wizz-icon name="user-plus" [size]="15" /> Create an Account
                  </a>
                  <a
                    routerLink="/auth/login"
                    class="drop-link"
                    (click)="companyMenuOpen.set(false)"
                  >
                    <wizz-icon name="log-out" [size]="15" /> Sign In
                  </a>
                </div>
              }
            </div>

            <wizz-button size="sm" (clicked)="go('/auth/login')">Login</wizz-button>
            <wizz-button size="sm" (clicked)="go('/auth/signup')">Sign Up</wizz-button>
          </div>
        </div>
      </header>

      <!-- Hero Section (Screen 01) -->
      <section class="hero-section">
        <div class="hero-copy">
          <span class="product-pill">{{ theme.brand().badgeLabel }}</span>
          <h1>Global Payments Made<br />Simple &amp; Secure</h1>
          <p>
            From Developers to enterprises to fintech innovators - send, receive, and integrate
            cross-border payments in minutes with zero complexity and crystal-clear pricing.
          </p>
          <div class="hero-ctas">
            <wizz-button size="lg" (clicked)="go('/auth/login')">Login</wizz-button>
            <wizz-button size="lg" variant="outline" (clicked)="go('/auth/signup')">
              Sign Up
            </wizz-button>
          </div>
        </div>

        <div class="hero-visual">
          <img
            src="/assets/hero-phone.jpg"
            alt="Paygate mobile balance and send money preview"
            class="hero-phone-img"
            fetchpriority="high"
            decoding="async"
          />
        </div>
      </section>

      <!-- Features Section (Screen 01) -->
      <section class="features-section" id="coverage">
        <div class="features-head">
          <h2>Your Payments, Everywhere &amp; Secure</h2>
          <p>
            Send and receive payments in more than 150 currencies with competitive rates and no
            hidden fees, making global transactions as easy as local ones
          </p>
        </div>

        <div class="features-grid">
          <!-- Card 1: 150+ Currencies -->
          <article class="feature-card">
            <div class="coverage-pill-stage">
              <div class="pill-row">
                @for (c of rowOneCountries; track c.name) {
                  <span class="country-chip">
                    <span class="flag">{{ c.flag }}</span>
                    <span>{{ c.name }}</span>
                  </span>
                }
              </div>
              <div class="pill-row pill-row--offset">
                @for (c of rowTwoCountries; track c.name) {
                  <span class="country-chip">
                    <span class="flag">{{ c.flag }}</span>
                    <span>{{ c.name }}</span>
                  </span>
                }
              </div>
            </div>

            <div class="feature-body">
              <h3>Support for over 150 currencies</h3>
              <p>
                Send and receive payments in more than 150 currencies with competitive rates and no
                hidden fees, making global transactions as easy as local ones
              </p>
              <button type="button" class="wizz-link" (click)="showCoverageModal.set(true)">
                View Full Coverage
              </button>
            </div>
          </article>

          <!-- Card 2: 100% Secure and Compliant -->
          <article class="feature-card" id="security">
            <div class="compliance-stage">
              <img
                src="/assets/compliance-badges.jpg"
                alt="ISO 27001, AICPA SOC, and PCI DSS compliance certifications"
                class="compliance-img"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div class="feature-body">
              <h3>100% Secure and Compliant</h3>
              <p>
                Your transactions are protected by enterprise-grade security, meeting global
                standards like <strong>SOC 1 Type 1, SOC 2 Type 2, PCI DSS, and ISO 27001.</strong>
              </p>
              <button type="button" class="wizz-link" (click)="showSecurityModal.set(true)">
                Learn More
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- Coverage Modal -->
      <wizz-modal
        [open]="showCoverageModal()"
        title="150+ Supported Currencies &amp; Corridors"
        subtitle="Send, hold, and receive local payments across Americas, Europe, Asia-Pacific, Middle East, and Africa."
        tone="info"
        [maxWidth]="500"
        (closed)="showCoverageModal.set(false)"
      >
        <div class="modal-country-grid">
          @for (c of allCountries; track c.code) {
            <div class="modal-country-item">
              <span>{{ c.flag }} {{ c.name }}</span>
              <wizz-badge tone="verified">{{ c.currency }}</wizz-badge>
            </div>
          }
        </div>
        <wizz-button [fullWidth]="true" (clicked)="go('/auth/signup')">
          Create Global Account
        </wizz-button>
      </wizz-modal>

      <!-- Compliance Modal -->
      <wizz-modal
        [open]="showSecurityModal()"
        title="Enterprise-Grade Security &amp; Compliance"
        subtitle="Every transaction is safeguarded with multi-layer encryption, liveness biometrics, and real-time AML screening."
        tone="success"
        (closed)="showSecurityModal.set(false)"
      >
        <ul class="sec-list">
          <li><strong>ISO 27001 Certified</strong> — Information Security Management System</li>
          <li><strong>SOC 1 Type 1 &amp; SOC 2 Type 2</strong> — Audited internal controls</li>
          <li>
            <strong>PCI DSS Level 1</strong> — Tokenized card vault &amp; small-charge verification
          </li>
          <li>
            <strong>KYC &amp; 3D Liveness</strong> — Automated government ID &amp; biometric checks
          </li>
        </ul>
        <wizz-button [fullWidth]="true" (clicked)="showSecurityModal.set(false)">Close</wizz-button>
      </wizz-modal>
    </div>
  `,
  styles: [
    `
      .landing-page {
        min-height: 100vh;
        background: #ffffff;
        display: flex;
        flex-direction: column;
      }
      .landing-header {
        position: sticky;
        top: 0;
        z-index: 200;
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid #f1f2f7;
      }
      .header-inner {
        max-width: 1180px;
        margin: 0 auto;
        padding: 12px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .brand-anchor {
        text-decoration: none;
      }
      .header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .company-menu-wrap {
        position: relative;
        margin-right: 8px;
      }
      .company-trigger {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: none;
        border: none;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--wizz-text);
        cursor: pointer;
        padding: 8px 10px;
        border-radius: 8px;
      }
      .company-trigger:hover {
        background: var(--wizz-surface-muted);
      }
      .company-dropdown {
        position: absolute;
        right: 0;
        top: calc(100% + 6px);
        width: 230px;
        background: #ffffff;
        border: 1px solid var(--wizz-border);
        border-radius: 14px;
        box-shadow: var(--wizz-shadow-md);
        padding: 8px;
      }
      .drop-link {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 9px 10px;
        border-radius: 8px;
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--wizz-text);
      }
      .drop-link:hover {
        background: var(--wizz-surface-muted);
      }

      /* Hero */
      .hero-section {
        max-width: 1180px;
        width: 100%;
        margin: 0 auto;
        padding: 42px 24px 52px;
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
        gap: 48px;
        align-items: center;
      }
      .product-pill {
        display: inline-block;
        padding: 5px 14px;
        border-radius: 8px;
        background: #f5f6fa;
        border: 1px solid var(--wizz-border);
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--wizz-text-secondary);
        margin-bottom: 18px;
      }
      .hero-copy h1 {
        margin: 0 0 18px;
        font-size: clamp(2.1rem, 4vw, 3.15rem);
        line-height: 1.14;
        letter-spacing: -0.025em;
        font-weight: 800;
        color: var(--wizz-text);
      }
      .hero-copy p {
        margin: 0 0 28px;
        max-width: 510px;
        font-size: 0.98rem;
        line-height: 1.62;
        color: var(--wizz-text-secondary);
      }
      .hero-ctas {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .hero-visual {
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 24px 48px rgba(14, 14, 20, 0.16);
        background: #0c0d12;
      }
      .hero-phone-img {
        display: block;
        width: 100%;
        height: auto;
      }

      /* Features */
      .features-section {
        scroll-margin-top: 76px;
        max-width: 1180px;
        width: 100%;
        margin: 0 auto;
        padding: 28px 24px 72px;
      }
      .features-head {
        text-align: center;
        max-width: 680px;
        margin: 0 auto 38px;
      }
      .features-head h2 {
        margin: 0 0 12px;
        font-size: clamp(1.55rem, 2.8vw, 2.05rem);
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      .features-head p {
        margin: 0;
        font-size: 0.92rem;
        line-height: 1.6;
        color: var(--wizz-text-secondary);
      }
      .features-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 24px;
      }
      .feature-card {
        scroll-margin-top: 80px;
        border: 1px solid var(--wizz-border);
        border-radius: 20px;
        background: #ffffff;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition:
          box-shadow 0.2s ease,
          transform 0.2s ease;
      }
      .feature-card:hover {
        box-shadow: var(--wizz-shadow-sm);
        transform: translateY(-2px);
      }
      .coverage-pill-stage {
        background: #f8f9fc;
        padding: 26px 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow: hidden;
        border-bottom: 1px solid #f0f1f6;
      }
      .pill-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: nowrap;
      }
      .pill-row--offset {
        margin-left: -18px;
      }
      .country-chip {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 15px;
        background: #ffffff;
        border: 1px solid #eaecf4;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 500;
        color: var(--wizz-text-secondary);
        white-space: nowrap;
        box-shadow: 0 1px 3px rgba(16, 24, 40, 0.03);
      }
      .compliance-stage {
        background: #ffffff;
        padding: 14px 18px 6px;
        border-bottom: 1px solid #f0f1f6;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 142px;
      }
      .compliance-img {
        width: 100%;
        max-width: 440px;
        height: auto;
        display: block;
      }
      .feature-body {
        padding: 24px 26px 28px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      .feature-body h3 {
        margin: 0;
        font-size: 1.08rem;
        font-weight: 700;
      }
      .feature-body p {
        margin: 0 0 6px;
        font-size: 0.86rem;
        line-height: 1.58;
        color: var(--wizz-text-secondary);
      }

      .modal-country-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        max-height: 280px;
        overflow-y: auto;
      }
      .modal-country-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        border-radius: 8px;
        background: var(--wizz-surface-muted);
        font-size: 0.8rem;
      }
      .sec-list {
        margin: 0;
        padding-left: 18px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 0.82rem;
        color: var(--wizz-text-secondary);
        text-align: left;
      }

      /* Mobile Responsive matching Figma Screen 01 left mobile layout! */
      @media (max-width: 840px) {
        .company-menu-wrap {
          display: none;
        }
        .header-inner {
          padding: 14px 16px;
        }
        .hero-section {
          grid-template-columns: 1fr;
          padding: 16px 16px 36px;
          gap: 22px;
        }
        .hero-copy h1 {
          font-size: clamp(1.7rem, 7vw, 2rem);
          line-height: 1.12;
          margin-bottom: 14px;
        }
        .hero-copy p {
          font-size: 0.92rem;
          margin-bottom: 22px;
        }
        /* Image first on mobile, just like Figma 01! */
        .hero-visual {
          order: -1;
        }
        .product-pill {
          display: none;
        }
        .hero-ctas {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        :host ::ng-deep .hero-ctas wizz-button,
        :host ::ng-deep .hero-ctas wizz-button .wizz-btn {
          width: 100%;
        }
        .features-section {
          padding: 12px 16px 48px;
        }
        .features-head {
          text-align: left;
          margin-bottom: 22px;
        }
        .features-grid {
          grid-template-columns: 1fr;
          gap: 18px;
        }
        .modal-country-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class LandingPageComponent {
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly rowOneCountries = LANDING_COVERAGE_COUNTRIES.slice(0, 5);
  protected readonly rowTwoCountries = LANDING_COVERAGE_COUNTRIES.slice(5);
  protected readonly allCountries = COUNTRIES;

  readonly companyMenuOpen = signal(false);
  readonly showCoverageModal = signal(false);
  readonly showSecurityModal = signal(false);

  go(path: string): void {
    this.router.navigate([path]);
  }
}
