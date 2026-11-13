import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { PreloadAllModules, provideRouter, Routes, withPreloading } from '@angular/router';
import { LandingPageComponent } from './landing/landing-page.component';
import {
  BrandConfig,
  DEFAULT_PAYGATE_BRAND,
  provideBrandConfig,
  ThemeService,
} from '@wizz/design-tokens';
import { provideWizzIcons } from '@wizz/ui';
import { WizzPlatformStore } from '@wizz/remittance-data-access';

const PARTNER_BRAND: BrandConfig = {
  ...DEFAULT_PAYGATE_BRAND,
  appId: 'wizz-partner-portal',
  name: 'Wizz Partner',
  badgeLabel: 'Partner',
  tagline: 'Global Payments for Partners',
  walletLabel: 'Partner Balance',
};

const partnerRoutes: Routes = [
  { path: '', component: LandingPageComponent },
  {
    path: 'auth/signup',
    loadComponent: () =>
      import('./pages/auth/signup-page.component').then((m) => m.SignupPageComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./pages/auth/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () =>
      import('./pages/auth/forgot-reset-password.component').then(
        (m) => m.ForgotResetPasswordPageComponent,
      ),
  },
  {
    path: 'legal',
    loadComponent: () =>
      import('./app/legal-information-page.component').then(
        (m) => m.PartnerLegalInformationPageComponent,
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-and-accounts.component').then(
        (m) => m.DashboardAndAccountsComponent,
      ),
  },
  {
    path: 'payments',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-and-accounts.component').then(
        (m) => m.DashboardAndAccountsComponent,
      ),
  },
  {
    path: 'payment-methods',
    loadComponent: () =>
      import('./pages/payment-methods/payment-methods-page.component').then(
        (m) => m.PaymentMethodsPageComponent,
      ),
  },
  {
    path: 'beneficiaries',
    loadComponent: () =>
      import('./pages/beneficiaries/beneficiaries-page.component').then(
        (m) => m.BeneficiariesPageComponent,
      ),
  },
  {
    path: 'send-money',
    loadComponent: () =>
      import('./pages/send-money/send-money-page.component').then((m) => m.SendMoneyPageComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile-terms/profile-and-terms.component').then(
        (m) => m.ProfileAndTermsComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];

@Component({
  selector: 'wizz-partner-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class PartnerAppComponent {}

bootstrapApplication(PartnerAppComponent, {
  providers: [
    provideRouter(partnerRoutes, withPreloading(PreloadAllModules)),
    provideBrandConfig(PARTNER_BRAND),
    provideWizzIcons(),
    ThemeService,
    WizzPlatformStore,
  ],
}).catch((err) => console.error(err));
