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
  UiTabsComponent,
  ToastService,
  UiToastContainerComponent,
  WizzIconComponent,
} from '@wizz/ui';

@Component({
  selector: 'app-payment-methods-page',
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
    UiTabsComponent,
    UiEmptyStateComponent,
    UiAccordionComponent,
    UiToastContainerComponent,
    WizzIconComponent,
  ],
  template: `
    <wizz-app-shell>
      <div class="partner-payment-methods">
        <div class="pm-header">
          <h1>Partner Payment Methods</h1>
          <wizz-button leadingIcon="plus" (clicked)="openAddDrawer()">
            Add Method
          </wizz-button>
        </div>

        <wizz-tabs [tabs]="pmTabs" [(activeTab)]="activeTab" />

        @if (activeTab() === 'banks') {
          <wizz-empty-state
            icon="building"
            title="No Bank Accounts Linked"
            description="Add a bank account to receive payouts."
          >
            <wizz-button leadingIcon="plus" (clicked)="openAddDrawer()">
              Add Bank Account
            </wizz-button>
          </wizz-empty-state>
        } @else {
          <wizz-empty-state
            icon="credit-card"
            title="No Cards Linked"
            description="Add a debit or credit card for instant payments."
          >
            <wizz-button leadingIcon="plus" (clicked)="openAddDrawer()">
              Add Card
            </wizz-button>
          </wizz-empty-state>
        }
      </div>
    </wizz-app-shell>
    <wizz-modal [open]="showAddDialog()" title="Add Payment Method" subtitle="Add a bank account or card for partner payouts." tone="info" (closed)="showAddDialog.set(false)">
      <wizz-input label="Account or card name" placeholder="Enter a name" [(value)]="newMethodName" />
      <div drawer-footer>
        <wizz-button variant="outline" [fullWidth]="true" (clicked)="showAddDialog.set(false)">Cancel</wizz-button>
        <wizz-button [fullWidth]="true" (clicked)="saveMethod()">Save Method</wizz-button>
      </div>
    </wizz-modal>
    <wizz-toast-container />
  `,
  styles: [
    `
      .partner-payment-methods {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .pm-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .pm-header h1 {
        margin: 0;
        font-size: 1.45rem;
      }
    `,
  ],
})
export class PaymentMethodsPageComponent {
  private readonly toast = inject(ToastService);
  readonly pmTabs = [
    { id: 'banks', label: 'Bank Accounts' },
    { id: 'cards', label: 'Cards' },
  ] as const;
  readonly activeTab = signal('banks');
  readonly showAddDialog = signal(false);
  readonly newMethodName = signal('');

  openAddDrawer(): void {
    this.newMethodName.set('');
    this.showAddDialog.set(true);
  }

  saveMethod(): void {
    const name = this.newMethodName().trim();
    if (!name) {
      this.toast.show('Enter an account or card name to continue.', 'warning');
      return;
    }
    this.showAddDialog.set(false);
    this.toast.show(`${name} was saved as a payment method.`, 'success');
  }
}
