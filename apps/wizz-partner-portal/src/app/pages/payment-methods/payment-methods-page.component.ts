import { Component } from '@angular/core';
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
export class PaymentMethodsPageComponent {}
