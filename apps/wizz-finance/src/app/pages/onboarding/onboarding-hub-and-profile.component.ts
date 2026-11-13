import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WizzPlatformStore } from '@wizz/remittance-data-access';
import { AppShellComponent } from '@wizz/remittance-shell';
import { ToastService, UiButtonComponent, UiInputComponent, UiModalComponent, UiStepperComponent, WizzIconComponent } from '@wizz/ui';

@Component({
  selector: 'app-onboarding-hub-page',
  standalone: true,
  imports: [AppShellComponent, UiButtonComponent, UiInputComponent, UiModalComponent, UiStepperComponent, WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wizz-app-shell>
      <div class="hub-stack">
        <h1>Let's Get You Set Up</h1>
        <p class="sub">Complete your profile to unlock full global payment capabilities.</p>
        <wizz-stepper [steps]="steps" [activeIndex]="activeStep()" />
        <div class="hub-cards">
          <article class="hub-card" (click)="activeStep.set(0)">
            <div class="hub-visual"><wizz-icon name="user" [size]="24" /></div>
            <h3>Share Personal Details</h3><p>Gender, Birth Place, Permanent Address, Social Accounts, Employment.</p>
          </article>
          <article class="hub-card" (click)="activeStep.set(1)">
            <div class="hub-visual"><wizz-icon name="id-card" [size]="24" /></div>
            <h3>Verify Identity Document</h3><p>Upload National ID, Passport, or Driving License.</p>
          </article>
          <article class="hub-card" (click)="activeStep.set(2)">
            <div class="hub-visual"><wizz-icon name="camera" [size]="24" /></div>
            <h3>Take a Selfie</h3><p>Complete the liveness check to secure your account.</p>
          </article>
        </div>
      </div>
    </wizz-app-shell>
    <wizz-modal [open]="showSocialPhoneOtp()" tone="info" title="Social Phone Verification" subtitle="Enter the 6-digit code sent to your phone via SMS." (closed)="showSocialPhoneOtp.set(false)">
      <wizz-input label="OTP Code" type="number" [(value)]="socialOtp" />
      <div drawer-footer><wizz-button [fullWidth]="true" (clicked)="verifySocialOtp()">Verify Now</wizz-button></div>
    </wizz-modal>
  `,
  styles: [
    `
      .hub-stack { display: flex; flex-direction: column; gap: 20px; }
      .hub-stack h1 { margin: 0; font-size: 1.45rem; font-weight: 800; }
      .sub { margin: 4px 0 0; font-size: 0.84rem; color: var(--wizz-text-secondary); }
      .hub-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
      .hub-card { border: 1px solid var(--wizz-border); border-radius: 16px; padding: 18px; background: #ffffff; cursor: pointer; display: flex; flex-direction: column; gap: 8px; }
      .hub-card:hover { border-color: var(--wizz-primary); box-shadow: var(--wizz-shadow-sm); }
      .hub-visual { width: 48px; height: 48px; border-radius: 12px; background: var(--wizz-surface-muted); display: inline-flex; align-items: center; justify-content: center; color: var(--wizz-text); }
      .hub-card h3 { margin: 0; font-size: 0.95rem; font-weight: 700; }
      .hub-card p { margin: 0; font-size: 0.78rem; line-height: 1.5; color: var(--wizz-text-secondary); flex: 1; }
    `,
  ],
})
export class OnboardingHubPageComponent {
  protected readonly store = inject(WizzPlatformStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly steps = [{ id: 'personal', label: 'Personal Details' }, { id: 'kyc', label: 'Identity Document' }, { id: 'liveness', label: 'Liveness Check' }];
  readonly activeStep = signal(0);
  readonly showSocialPhoneOtp = signal(false);
  readonly socialOtp = signal('');
  verifySocialOtp(): void {
    this.toast.show('Phone verified successfully', 'success');
    this.showSocialPhoneOtp.set(false);
  }
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [AppShellComponent, UiButtonComponent, UiInputComponent, UiModalComponent, WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wizz-app-shell>
      <div class="profile-stack">
        <h1>Personal Details Wizard</h1>
        <div class="wizard-steps"><span class="step active">1</span><span class="step">2</span><span class="step">3</span><span class="step">4</span></div>
        <wizz-input label="Gender" [(value)]="gender" />
        <wizz-input label="Birth Place" [(value)]="birthPlace" />
        <wizz-input label="Permanent Address" [(value)]="address" />
        <wizz-input label="Occupation" [(value)]="occupation" />
        <wizz-input label="Employer Name" [(value)]="employer" />
        <wizz-button [fullWidth]="true" (clicked)="saveProfile()">Save Profile</wizz-button>
      </div>
    </wizz-app-shell>
  `,
  styles: [
    `
      .profile-stack { display: flex; flex-direction: column; gap: 16px; max-width: 500px; }
      .profile-stack h1 { margin: 0; font-size: 1.45rem; font-weight: 800; }
      .wizard-steps { display: flex; gap: 8px; }
      .step { width: 32px; height: 32px; border-radius: 50%; background: var(--wizz-border); display: inline-flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; }
      .step.active { background: var(--wizz-primary); color: #ffffff; }
    `,
  ],
})
export class OnboardingProfilePageComponent {
  protected readonly store = inject(WizzPlatformStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly gender = signal('');
  readonly birthPlace = signal('');
  readonly address = signal('');
  readonly occupation = signal('');
  readonly employer = signal('');
  saveProfile(): void {
    this.toast.show('Profile saved successfully', 'success');
    this.router.navigate(['/dashboard']);
  }
}

export { OnboardingHubPageComponent, OnboardingProfilePageComponent };
