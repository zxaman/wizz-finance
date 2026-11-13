import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing/landing-page.component';
import { SignupPageComponent } from './pages/auth/signup-page.component';
import { LoginPageComponent } from './pages/auth/login-page.component';
import {
  ForgotPasswordPageComponent,
  ResetPasswordPageComponent,
} from './pages/auth/forgot-reset-password.component';
import { LegalInformationPageComponent } from './pages/legal/legal-information-page.component';

const dashboardPage = () =>
  import('./pages/dashboard/dashboard-and-accounts.component').then(
    (m) => m.DashboardPageComponent,
  );
const paymentsPage = () =>
  import('./pages/dashboard/dashboard-and-accounts.component').then(
    (m) => m.PaymentsHistoryPageComponent,
  );
const receivingAccountsPage = () =>
  import('./pages/dashboard/dashboard-and-accounts.component').then(
    (m) => m.ReceivingAccountsPageComponent,
  );

/**
 * Each auth page owns its AuthSplitShell presentation. Keep these as direct
 * routes rather than nesting them under a shell component that has no outlet.
 */
export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'auth/signup', component: SignupPageComponent },
  { path: 'auth/login', component: LoginPageComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordPageComponent },
  { path: 'auth/reset-password', component: ResetPasswordPageComponent },
  { path: 'legal', component: LegalInformationPageComponent },
  { path: 'dashboard', loadComponent: dashboardPage },
  { path: 'payments', loadComponent: paymentsPage },
  { path: 'receiving-accounts', loadComponent: receivingAccountsPage },
  {
    path: 'beneficiaries',
    loadComponent: () =>
      import('./pages/beneficiaries/beneficiaries-page.component').then(
        (m) => m.BeneficiariesPageComponent,
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
    path: 'send-money',
    loadComponent: () =>
      import('./pages/send-money/send-money-page.component').then((m) => m.SendMoneyPageComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile-terms/profile-and-terms.component').then(
        (m) => m.ProfileAndTermsPageComponent,
      ),
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./pages/onboarding/onboarding-hub-and-profile.component').then(
        (m) => m.OnboardingHubPageComponent,
      ),
  },
  {
    path: 'onboarding/profile',
    loadComponent: () =>
      import('./pages/onboarding/onboarding-hub-and-profile.component').then(
        (m) => m.OnboardingProfilePageComponent,
      ),
  },
  {
    path: 'onboarding/kyc',
    loadComponent: () =>
      import('./pages/onboarding/kyc-and-liveness.component').then((m) => m.KycPageComponent),
  },
  {
    path: 'onboarding/liveness',
    loadComponent: () =>
      import('./pages/onboarding/kyc-and-liveness.component').then((m) => m.LivenessPageComponent),
  },
  { path: '**', redirectTo: '' },
];
