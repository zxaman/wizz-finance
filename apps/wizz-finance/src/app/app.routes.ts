import { Routes } from '@angular/router';
import { AuthSplitShellComponent } from '@wizz/remittance-shell';
import { LandingPageComponent } from './pages/landing/landing-page.component';
import { SignupPageComponent } from './pages/auth/signup-page.component';
import { LoginPageComponent } from './pages/auth/login-page.component';
import { ForgotPasswordPageComponent, ResetPasswordPageComponent } from './pages/auth/forgot-reset-password.component';

/**
 * Screen 01 is the current delivery slice. Keep the landing and its primary
 * account-entry routes mounted while subsequent Figma screens are completed.
 */
export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  {
    path: 'auth',
    component: AuthSplitShellComponent,
    children: [
      { path: 'signup', component: SignupPageComponent },
      { path: 'login', component: LoginPageComponent },
      { path: 'forgot-password', component: ForgotPasswordPageComponent },
      { path: 'reset-password', component: ResetPasswordPageComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
