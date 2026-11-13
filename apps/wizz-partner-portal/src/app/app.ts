import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import {
  AppShellComponent,
  AuthSplitShellComponent,
} from '@wizz/remittance-shell';
import {
  BrandConfig,
  DEFAULT_PAYGATE_BRAND,
  PARTNER_BRAND,
  provideBrandConfig,
  ThemeService,
} from '@wizz/design-tokens';
import { provideWizzIcons } from '@wizz/ui';
import { WizzPlatformStore } from '@wizz/remittance-data-access';

const partnerRoutes: Routes = [
  {
    path: '',
    component: AuthSplitShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./app/landing/landing-page.component').then(
            (m) => m.LandingPageComponent
          ),
      },
      {
        path: 'auth',
        children: [
          {
            path: 'signup',
            loadComponent: () =>
              import('./app/pages/auth/signup-page.component').then(
                (m) => m.SignupPageComponent
              ),
          },
          {
            path: 'login',
            loadComponent: () =>
              import('./app/pages/auth/login-page.component').then(
                (m) => m.LoginPageComponent
              ),
          },
          {
            path: 'forgot-password',
            loadComponent: () =>
              import('./app/pages/auth/forgot-reset-password.component').then(
                (m) => m.ForgotResetPasswordPageComponent
              ),
          },
        ],
      },
    ],
  },
  {
    path: 'dashboard',
    component: AppShellComponent,
    loadChildren: () =>
      import('./app/pages/dashboard/dashboard-and-accounts.routes').then(
        (m) => m.dashboardRoutes
      ),
  },
  {
    path: 'profile',
    component: AppShellComponent,
    loadComponent: () =>
      import('./app/pages/profile-terms/profile-and-terms.component').then(
        (m) => m.ProfileAndTermsPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@Component({
  selector: 'wizz-partner-root',
  standalone: true,
  template: `<router-outlet />`,
})
export class PartnerAppComponent {}

bootstrapApplication(PartnerAppComponent, {
  providers: [
    provideRouter(partnerRoutes),
    provideBrandConfig(PARTNER_BRAND),
    provideWizzIcons(),
    ThemeService,
    WizzPlatformStore,
  ],
}).catch((err) => console.error(err));
