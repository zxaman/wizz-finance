import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandLogoComponent, UiButtonComponent, WizzIconComponent } from '@wizz/ui';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, BrandLogoComponent, UiButtonComponent, WizzIconComponent],
  template: `
    <div class="landing-hero">
      <div class="hero-content">
        <wizz-brand-logo [customLabel]="'Partner'" />
        <h1>White-Label Remittance Portal</h1>
        <p>
          Deploy your own global payments platform powered by Wizz Finance. Fully customizable,
          secure, and compliant.
        </p>
        <div class="hero-actions">
          <a routerLink="/auth/signup" class="btn-primary">
            Get Started <wizz-icon name="arrow-right" [size]="18" />
          </a>
          <a routerLink="/auth/login" class="btn-outline">
            Partner Login
          </a>
        </div>
      </div>
      <div class="hero-visual">
        <img src="/assets/hero-phone.jpg" alt="Partner Portal Preview" fetchpriority="high" decoding="async" />
      </div>
    </div>

    <div class="landing-features">
      <div class="feature-grid">
        <article class="feature-card">
          <wizz-icon name="globe" [size]="32" />
          <h3>Global Coverage</h3>
          <p>Support for over 150 currencies and 200+ countries.</p>
        </article>
        <article class="feature-card">
          <wizz-icon name="shield-check" [size]="32" />
          <h3>100% Secure</h3>
          <p>Bank-grade encryption and compliance badges included.</p>
        </article>
        <article class="feature-card">
          <wizz-icon name="sparkles" [size]="32" />
          <h3>Instant Integration</h3>
          <p>Plug-and-play white-label UI components and APIs.</p>
        </article>
      </div>
    </div>
  `,
  styles: [
    `
      .landing-hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 60px 24px;
        background: #0e0e14;
        color: #ffffff;
        min-height: 60vh;
      }
      .hero-content {
        flex: 1;
        max-width: 520px;
      }
      .hero-content h1 {
        margin: 12px 0 16px;
        font-size: 2.2rem;
        font-weight: 800;
      }
      .hero-content p {
        margin: 0 0 24px;
        font-size: 1rem;
        color: #cbd5e1;
      }
      .hero-actions {
        display: flex;
        gap: 12px;
      }
      .btn-primary {
        background: #7965f0;
        color: #ffffff;
        padding: 12px 24px;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .btn-outline {
        background: transparent;
        border: 1px solid #7965f0;
        color: #7965f0;
        padding: 12px 24px;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 700;
      }
      .hero-visual {
        flex: 1;
        display: flex;
        justify-content: flex-end;
      }
      .hero-visual img {
        max-width: 100%;
        height: auto;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(121, 101, 240, 0.15);
      }

      .landing-features {
        padding: 60px 24px;
        background: #ffffff;
      }
      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
        max-width: 1100px;
        margin: 0 auto;
      }
      .feature-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 32px 24px;
        border-radius: 16px;
        border: 1px solid #f1f5f9;
        transition: transform 0.2s;
      }
      .feature-card:hover {
        transform: translateY(-4px);
        border-color: #7965f0;
      }
      .feature-card wizz-icon {
        color: #7965f0;
        margin-bottom: 16px;
      }
      .feature-card h3 {
        margin: 0 0 8px;
        font-size: 1.1rem;
      }
      .feature-card p {
        margin: 0;
        font-size: 0.88rem;
        color: #64748b;
      }

      @media (max-width: 768px) {
        .landing-hero {
          flex-direction: column;
          text-align: center;
        }
        .hero-visual {
          margin-top: 32px;
          justify-content: center;
        }
        .hero-visual img {
          max-width: 320px;
        }
      }
    `,
  ],
})
export class LandingPageComponent {}
