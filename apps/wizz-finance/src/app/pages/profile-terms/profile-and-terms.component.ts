import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WizzPlatformStore } from '@wizz/remittance-data-access';
import { AppShellComponent } from '@wizz/remittance-shell';
import { SelectOption, ToastService, UiAccordionComponent, UiBadgeComponent, UiButtonComponent, UiInputComponent, UiModalComponent, UiSelectComponent, WizzIconComponent } from '@wizz/ui';
import { COUNTRIES } from '@wizz/utils';

@Component({
  selector: 'app-profile-and-terms-page',
  standalone: true,
  imports: [FormsModule, AppShellComponent, UiButtonComponent, UiInputComponent, UiModalComponent, UiAccordionComponent, UiSelectComponent, UiBadgeComponent, WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wizz-app-shell>
      <div class="profile-stack">
        <h1>My Profile</h1>
        <p class="sub">Manage your personal details, contact information, and security settings.</p>
        <wizz-accordion title="Personal Details">
          <wizz-input label="First Name" [(value)]="store.user().firstName" />
          <wizz-input label="Last Name" [(value)]="store.user().lastName" />
          <wizz-input label="Email" [(value)]="store.user().email" />
          <wizz-select label="Nationality" [options]="countryOptions" [(value)]="store.user().nationality" />
        </wizz-accordion>
        <wizz-accordion title="Contact Details">
          <wizz-input label="Phone Number" [(value)]="store.user().phone" />
          <wizz-input label="Address" [(value)]="addressLine" />
        </wizz-accordion>
        <wizz-accordion title="Identification Documents">
          <div class="doc-row"><span>Passport</span><wizz-badge tone="verified">Verified</wizz-badge></div>
          <div class="doc-row"><span>National ID</span><wizz-badge tone="pending">Pending</wizz-badge></div>
        </wizz-accordion>
        <wizz-accordion title="Additional Info">
          <wizz-input label="Occupation" [(value)]="store.user().occupation" />
        </wizz-accordion>
        <wizz-accordion title="Account Limits &amp; Capabilities">
          <div class="limit-row"><span>Daily Limit</span><strong>$50,000.00</strong></div>
          <div class="limit-row"><span>Monthly Limit</span><strong>$500,000.00</strong></div>
        </wizz-accordion>
        <wizz-accordion title="Contact Support">
          <wizz-button [fullWidth]="true" (clicked)="toast.show('Support ticket opened', 'success')">Open Support Ticket</wizz-button>
        </wizz-accordion>
        <wizz-accordion title="Security &amp; Notifications">
          <wizz-button [fullWidth]="true" variant="outline" (clicked)="toast.show('Security settings updated', 'success')">Update Security Settings</wizz-button>
        </wizz-accordion>
        <wizz-button variant="outline" (clicked)="logout()">Logout</wizz-button>
        <wizz-button variant="danger-outline" (clicked)="confirmDelete()">Delete Account</wizz-button>
      </div>
    </wizz-app-shell>
    <wizz-modal [open]="showDeleteConfirm()" tone="danger" title="Delete Account?" subtitle="This action is permanent. Are you sure?" (closed)="showDeleteConfirm.set(false)">
      <div drawer-footer><wizz-button variant="outline" [fullWidth]="true" (clicked)="showDeleteConfirm.set(false)">Cancel</wizz-button><wizz-button variant="danger" [fullWidth]="true" (clicked)="executeDelete()">Delete Account</wizz-button></div>
    </wizz-modal>
  `,
  styles: [
    `
      .profile-stack { display: flex; flex-direction: column; gap: 16px; max-width: 500px; }
      .profile-stack h1 { margin: 0; font-size: 1.45rem; font-weight: 800; }
      .sub { margin: 4px 0 0; font-size: 0.84rem; color: var(--wizz-text-secondary); }
      .doc-row, .limit-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 0.84rem; }
    `,
  ],
})
export class ProfileAndTermsPageComponent {
  protected readonly store = inject(WizzPlatformStore);
  private readonly router = inject(Router);
  protected readonly toast = inject(ToastService);
  readonly addressLine = signal(this.store.user().address.line1);
  protected readonly countryOptions: readonly SelectOption[] = COUNTRIES.map(c => ({ value: c.code, label: c.name }));
  readonly showDeleteConfirm = signal(false);
  logout(): void {
    this.store.logout();
    this.router.navigate(['/auth/login']);
  }
  confirmDelete(): void { this.showDeleteConfirm.set(true); }
  executeDelete(): void {
    this.store.logout();
    this.showDeleteConfirm.set(false);
    this.router.navigate(['/auth/signup']);
  }
}

@Component({
  selector: 'app-my-profile-page',
  standalone: true,
  imports: [ProfileAndTermsPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-profile-and-terms-page />`,
})
export class MyProfilePageComponent {}

@Component({
  selector: 'app-terms-page',
  standalone: true,
  imports: [FormsModule, AppShellComponent, UiButtonComponent, WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wizz-app-shell>
      <div class="terms-stack">
        <h1>Terms &amp; Conditions</h1>
        <p class="sub">Last Updated on - 2 May 2025</p>
        <div class="terms-content">
          <p>Welcome to Paygate. By using our service, you agree to these terms...</p>
          <p>1. Global Payments Made Simple &amp; Secure.</p>
          <p>2. Compliance with local regulations in all supported countries.</p>
          <p>3. Transparent FX rates and fees.</p>
        </div>
        <div class="consent-row"><label class="chk-row"><input type="checkbox" [(ngModel)]="consent" /><span>I Agree</span></label></div>
        <wizz-button [fullWidth]="true" [disabled]="!consent()" (clicked)="accept()">Accept Terms</wizz-button>
      </div>
    </wizz-app-shell>
  `,
  styles: [
    `
      .terms-stack { display: flex; flex-direction: column; gap: 16px; max-width: 600px; }
      .terms-stack h1 { margin: 0; font-size: 1.45rem; font-weight: 800; }
      .sub { margin: 4px 0 0; font-size: 0.84rem; color: var(--wizz-text-secondary); }
      .terms-content { padding: 16px; border-radius: 10px; background: #ffffff; border: 1px solid var(--wizz-border); font-size: 0.84rem; line-height: 1.5; }
      .consent-row { display: flex; align-items: center; gap: 8px; padding: 12px; border-radius: 10px; background: var(--wizz-surface-muted); font-size: 0.82rem; }
      .chk-row input { width: 16px; height: 16px; accent-color: var(--wizz-primary); }
    `,
  ],
})
export class TermsPageComponent {
  protected readonly store = inject(WizzPlatformStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly consent = signal(false);
  accept(): void {
    this.toast.show('Terms accepted', 'success');
    this.router.navigate(['/dashboard']);
  }
}
