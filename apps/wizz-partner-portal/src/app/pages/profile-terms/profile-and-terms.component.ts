import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '@wizz/remittance-shell';
import {
  BrandLogoComponent,
  UiAccordionComponent,
  UiBadgeComponent,
  UiButtonComponent,
  UiDrawerComponent,
  UiEmptyStateComponent,
  UiInputComponent,
  UiModalComponent,
  UiSelectComponent,
  ToastService,
  UiToastContainerComponent,
  WizzIconComponent,
} from '@wizz/ui';

@Component({
  selector: 'app-profile-and-terms-page',
  standalone: true,
  imports: [
    RouterLink,
    AppShellComponent,
    BrandLogoComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiInputComponent,
    UiSelectComponent,
    UiDrawerComponent,
    UiModalComponent,
    UiAccordionComponent,
    UiEmptyStateComponent,
    UiToastContainerComponent,
    WizzIconComponent,
  ],
  template: `
    <wizz-app-shell>
      <div class="partner-profile">
        <h1>Partner Profile</h1>
        <wizz-brand-logo [customLabel]="'Partner'" />

        <wizz-accordion title="Partner Details">
          <div class="detail-grid">
            <div><small>Partner Name</small><strong>Partner Agency Inc.</strong></div>
            <div><small>Contact Email</small><strong>agency@partner.com</strong></div>
          </div>
        </wizz-accordion>

        <wizz-accordion title="Terms &amp; Conditions">
          <div class="terms-content">
            <p>Last Updated on - 2 May 2025</p>
            <p>Partner portal terms apply...</p>
          </div>
          <wizz-button [fullWidth]="true" (clicked)="toast.show('Terms accepted', 'success')">
            I Agree
          </wizz-button>
        </wizz-accordion>
      </div>
    </wizz-app-shell>
    <wizz-toast-container />
  `,
  styles: [
    `
      .partner-profile {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .detail-grid small {
        display: block;
        font-size: 0.7rem;
        color: #64748b;
        margin-bottom: 2px;
      }
      .detail-grid strong {
        font-size: 0.82rem;
      }
      .terms-content {
        font-size: 0.84rem;
        line-height: 1.5;
        color: #1e293b;
        padding: 16px;
        background: #f8fafc;
        border-radius: 10px;
      }
    `,
  ],
})
export class ProfileAndTermsComponent {
  protected readonly toast = inject(ToastService);
}
