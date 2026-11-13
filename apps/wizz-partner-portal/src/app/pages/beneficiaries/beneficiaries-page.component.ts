import { Component, inject, signal } from '@angular/core';
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
  selector: 'app-beneficiaries-page',
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
      <div class="partner-beneficiaries">
        <div class="ben-header">
          <h1>Partner Beneficiaries</h1>
          <wizz-button leadingIcon="plus" (clicked)="openAddDrawer()">
            Add Beneficiary
          </wizz-button>
        </div>

        <div class="ben-grid">
          <article class="ben-card">
            <div class="ben-ident">
              <span class="ben-avatar">JD</span>
              <strong>Jane Doe</strong>
            </div>
            <small>Individual · Family</small>
          </article>
          <article class="ben-card">
            <div class="ben-ident">
              <span class="ben-avatar">AC</span>
              <strong>Acme Corp</strong>
            </div>
            <small>Business · Corporate</small>
          </article>
        </div>
      </div>
    </wizz-app-shell>
    <wizz-modal [open]="showAddDialog()" title="Add Partner Beneficiary" subtitle="Enter the beneficiary details to continue." tone="info" (closed)="showAddDialog.set(false)">
      <wizz-input label="Beneficiary Name" placeholder="Enter full name" [(value)]="newBeneficiaryName" />
      <div drawer-footer>
        <wizz-button variant="outline" [fullWidth]="true" (clicked)="showAddDialog.set(false)">Cancel</wizz-button>
        <wizz-button [fullWidth]="true" (clicked)="saveBeneficiary()">Save Beneficiary</wizz-button>
      </div>
    </wizz-modal>
    <wizz-toast-container />
  `,
  styles: [
    `
      .partner-beneficiaries {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .ben-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .ben-header h1 {
        margin: 0;
        font-size: 1.45rem;
      }
      .ben-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }
      .ben-card {
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 16px 18px;
        background: #ffffff;
      }
      .ben-ident {
        display: flex;
        align-items: center;
        gap: 9px;
        margin-bottom: 6px;
      }
      .ben-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #ede9fe;
        color: #7965f0;
        font-size: 0.72rem;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .ben-ident strong {
        font-size: 0.85rem;
      }
      small {
        font-size: 0.74rem;
        color: #64748b;
      }
    `,
  ],
})
export class BeneficiariesPageComponent {
  private readonly toast = inject(ToastService);
  readonly showAddDialog = signal(false);
  readonly newBeneficiaryName = signal('');

  openAddDrawer(): void {
    this.newBeneficiaryName.set('');
    this.showAddDialog.set(true);
  }

  saveBeneficiary(): void {
    const name = this.newBeneficiaryName().trim();
    if (!name) {
      this.toast.show('Enter a beneficiary name to continue.', 'warning');
      return;
    }
    this.showAddDialog.set(false);
    this.toast.show(`${name} was added to your beneficiaries.`, 'success');
  }
}
