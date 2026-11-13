import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '@wizz/design-tokens';
import { BrandLogoComponent, WizzIconComponent } from '@wizz/ui';

interface PromoSlide {
  readonly title: string;
  readonly description: string;
}

const PROMO_SLIDES: readonly PromoSlide[] = [
  {
    title: 'Local Accounts in Global Currencies',
    description:
      'We provide you with virtual local account numbers, so international clients can pay you like a local. No delays, no conversion chaos.',
  },
  {
    title: 'Support for Over 150+ Currencies',
    description:
      'Send and receive cross-border payments with real-time transparent FX rates and zero hidden intermediary fees.',
  },
  {
    title: 'Enterprise-Grade Security & Compliance',
    description:
      'Protected by multi-factor authentication, automated KYC verification, SOC 2 Type 2, PCI DSS, and ISO 27001 standards.',
  },
  {
    title: 'Instant Beneficiary & Card Management',
    description:
      'Link bank accounts via micro-deposit or verify cards in seconds to pay partners, family, and contractors worldwide.',
  },
];

@Component({
  selector: 'wizz-auth-split-shell',
  standalone: true,
  imports: [RouterLink, BrandLogoComponent, WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      <!-- Mobile Header (< 960px) -->
      <header class="auth-mobile-top">
        <div class="mobile-auth-bar">
          <button type="button" class="mobile-back" (click)="backClicked.emit()">
            <wizz-icon name="chevron-left" [size]="20" />
            <wizz-brand-logo size="sm" />
          </button>
          @if (altActionLabel()) {
            <div class="mobile-alt-action">
              @if (altPromptText()) {
                <span>{{ altPromptText() }}</span>
              }
              <button type="button" class="mobile-alt-link" (click)="altActionClicked.emit()">
                {{ altActionLabel() }}
              </button>
            </div>
          }
        </div>
      </header>

      <div class="auth-grid">
        <!-- Left Promo Panel (Desktop) -->
        <aside class="promo-panel">
          <div class="promo-visual-wrap">
            <img
              src="/assets/auth-promo.jpg"
              alt="Global multi-currency accounts preview"
              class="promo-img"
              fetchpriority="high"
              decoding="async"
            />
          </div>

          <div class="promo-copy">
            <h2>{{ slides[activeSlide()].title }}</h2>
            <p>{{ slides[activeSlide()].description }}</p>

            <div class="carousel-dots" role="tablist" aria-label="Highlights">
              @for (slide of slides; track slide.title; let i = $index) {
                <button
                  type="button"
                  class="dot"
                  [class.dot--active]="i === activeSlide()"
                  (click)="activeSlide.set(i)"
                  [attr.aria-label]="'Slide ' + (i + 1)"
                ></button>
              }
            </div>
          </div>

          <div class="promo-footer">
            <button type="button" class="back-pill" (click)="backClicked.emit()">
              <wizz-icon name="arrow-left" [size]="15" />
              <span>{{ backLabel() }}</span>
            </button>

            @if (altActionLabel()) {
              <div class="alt-prompt">
                @if (altPromptText()) {
                  <span>{{ altPromptText() }}</span>
                }
                <button type="button" class="alt-link" (click)="altActionClicked.emit()">
                  {{ altActionLabel() }}
                </button>
              </div>
            }
          </div>
        </aside>

        <!-- Right Form Column -->
        <main class="form-panel">
          <div class="form-brand-desktop">
            <a routerLink="/" class="brand-home-link">
              <wizz-brand-logo />
            </a>
          </div>

          <div class="form-inner">
            <ng-content />
          </div>

          <footer class="legal-footer">
            <a routerLink="/legal" [queryParams]="{ view: 'terms' }">Terms &amp; Conditions</a>
            <a routerLink="/legal" [queryParams]="{ view: 'privacy' }">Privacy Policies</a>
          </footer>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-page {
        min-height: 100vh;
        background: #ffffff;
        display: flex;
        flex-direction: column;
      }
      .auth-mobile-top {
        display: none;
        padding: 14px 20px 8px;
      }
      .mobile-auth-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .mobile-alt-action {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        min-width: 0;
        color: var(--wizz-text-secondary);
        font-size: 0.74rem;
        text-align: right;
      }
      .mobile-alt-link {
        flex: 0 0 auto;
        border: 0;
        border-radius: 8px;
        padding: 8px 10px;
        background: var(--wizz-primary-soft);
        color: var(--wizz-primary);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }
      .mobile-alt-link:focus-visible,
      .mobile-back:focus-visible,
      .alt-link:focus-visible,
      .back-pill:focus-visible,
      .dot:focus-visible {
        outline: 2px solid var(--wizz-primary);
        outline-offset: 3px;
      }
      .mobile-back {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
      }
      .auth-grid {
        flex: 1;
        max-width: 1220px;
        width: 100%;
        margin: 0 auto;
        padding: 24px;
        display: grid;
        grid-template-columns: minmax(420px, 510px) minmax(0, 1fr);
        gap: 48px;
        align-items: stretch;
      }
      .promo-panel {
        background: #f6f7fb;
        border-radius: 24px;
        padding: 22px 24px 24px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border: 1px solid #eceef5;
      }
      .promo-visual-wrap {
        border-radius: 18px;
        overflow: hidden;
        background: #eceef4;
      }
      .promo-img {
        display: block;
        width: 100%;
        height: auto;
        object-fit: cover;
      }
      .promo-copy {
        text-align: center;
        padding: 28px 18px 18px;
      }
      .promo-copy h2 {
        margin: 0 0 10px;
        font-size: 1.32rem;
        font-weight: 700;
        color: var(--wizz-text);
      }
      .promo-copy p {
        margin: 0 auto 20px;
        max-width: 380px;
        font-size: 0.84rem;
        line-height: 1.55;
        color: var(--wizz-text-secondary);
      }
      .carousel-dots {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .dot {
        width: 8px;
        height: 6px;
        border-radius: 999px;
        border: none;
        background: #d5d8e4;
        padding: 0;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .dot--active {
        width: 28px;
        background: #14151a;
      }
      .promo-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 14px;
        font-size: 0.8rem;
      }
      .back-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        color: var(--wizz-text-secondary);
        font-weight: 600;
        cursor: pointer;
        padding: 6px 4px;
      }
      .back-pill:hover {
        color: var(--wizz-text);
      }
      .alt-prompt {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: var(--wizz-text-secondary);
      }
      .alt-link {
        background: none;
        border: none;
        padding: 0;
        font-weight: 700;
        color: var(--wizz-text);
        cursor: pointer;
        font-size: 0.8rem;
      }
      .alt-link:hover {
        color: var(--wizz-primary);
      }

      .form-panel {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 16px 8px 8px;
      }
      .form-brand-desktop {
        max-width: 460px;
        width: 100%;
        margin: 0 auto 20px;
      }
      .brand-home-link {
        text-decoration: none;
      }
      .form-inner {
        max-width: 460px;
        width: 100%;
        margin: auto;
      }
      .legal-footer {
        max-width: 460px;
        width: 100%;
        margin: 28px auto 0;
        display: flex;
        align-items: center;
        gap: 18px;
        font-size: 0.75rem;
      }
      .legal-footer a {
        color: var(--wizz-text-muted);
      }
      .legal-footer a:hover {
        color: var(--wizz-primary);
      }

      @media (max-width: 959px) {
        .auth-mobile-top {
          display: block;
        }
        .promo-panel,
        .form-brand-desktop {
          display: none;
        }
        .auth-grid {
          grid-template-columns: 1fr;
          padding: 12px 20px 28px;
        }
        .form-panel {
          padding: 0;
        }
        .legal-footer {
          justify-content: center;
        }
      }
      @media (max-width: 380px) {
        .auth-mobile-top {
          padding-inline: 12px;
        }
        .mobile-auth-bar {
          gap: 6px;
        }
        .mobile-alt-action {
          gap: 4px;
        }
        .mobile-alt-action > span {
          display: none;
        }
        .mobile-alt-link {
          padding: 7px 8px;
        }
        .auth-grid {
          padding-inline: 14px;
        }
      }
    `,
  ],
})
export class AuthSplitShellComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly slides = PROMO_SLIDES;

  readonly backLabel = input<string>('Back To Home');
  readonly altPromptText = input<string>('');
  readonly altActionLabel = input<string>('');

  readonly backClicked = output<void>();
  readonly altActionClicked = output<void>();

  readonly activeSlide = signal(0);
}
