import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing/landing-page.component';
import { SignupPageComponent } from './pages/auth/signup-page.component';
import { LoginPageComponent } from './pages/auth/login-page.component';
import {
  ForgotPasswordPageComponent,
  ResetPasswordPageComponent,
} from './pages/auth/forgot-reset-password.component';

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
  { path: '**', redirectTo: '' },
];
