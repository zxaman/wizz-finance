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
  UiStepperComponent,
  WizzIconComponent,
} from '@wizz/ui';

@Component({
  selector: 'app-send-money-page',
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
    UiStepperComponent,
    UiEmptyStateComponent,
    UiAccordionComponent,
    WizzIconComponent,
  ],
  template: `
    <wizz-app-shell>
      <div class="partner-send-money">
        <h1>Make a Partner Payment</h1>

        <wizz-stepper [steps]="wizardSteps" [activeIndex]="wizardStep()" />

        <!-- Step 1: Amount -->
        @if (wizardStep() === 0) {
          <div class="drawer-stack">
            <div class="fx-hero">
              <div class="fx-row">
                <span>Sending</span>
                <wizz-input type="number" prefix="$" [(value)]="sendAmount" />
                <span>USD</span>
              </div>
              <div class="fx-arrow">
                <wizz-icon name="arrow-right" [size]="20" />
              </div>
              <div class="fx-row">
                <span>Receiving</span>
                <wizz-input type="number" prefix="₹" [(value)]="receiveAmount" />
                <wizz-select [options]="currencyOptions" [(value)]="receiveCurrency" />
              </div>
            </div>
            <wizz-button [fullWidth]="true" (clicked)="advanceStep()">
              Continue
            </wizz-button>
          </div>
        }

        <!-- Other steps mock -->
        @if (wizardStep() > 0) {
          <div class="drawer-stack">
            <p class="status-text">Partner flow step {{ wizardStep() + 1 }} content goes here.</p>
            <wizz-button variant="outline" [fullWidth]="true" (clicked)="wizardStep.set(0)">
              Back to Amount
            </wizz-button>
            <wizz-button [fullWidth]="true" (clicked)="advanceStep()">
              Continue
            </wizz-button>
          </div>
        }
      </div>
    </wizz-app-shell>
  `,
  styles: [
    `
      .partner-send-money {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .drawer-stack {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .fx-hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px;
        border-radius: 14px;
        background: #f8fafc;
      }
      .fx-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }
      .fx-row input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 1.35rem;
        font-weight: 800;
      }
      .fx-arrow {
        color: #64748b;
      }
      .status-text {
        font-size: 0.88rem;
        color: #64748b;
        text-align: center;
        padding: 20px;
      }
    `,
  ],
})
export class SendMoneyPageComponent {
  readonly wizardSteps = [
    { id: 'amount', label: 'Amount' },
    { id: 'beneficiary', label: 'Beneficiary' },
    { id: 'source', label: 'Source' },
    { id: 'details', label: 'Details' },
    { id: 'review', label: 'Review' },
  ];

  readonly wizardStep = signal(0);
  readonly sendAmount = signal('100');
  readonly receiveAmount = signal('8626.40');
  readonly receiveCurrency = signal<'INR' | 'AED' | 'GBP'>('INR');
  readonly currencyOptions = [
    { value: 'INR', label: 'Indian Rupee', prefix: '₹' },
    { value: 'AED', label: 'UAE Dirham', prefix: 'د.إ' },
    { value: 'GBP', label: 'British Pound', prefix: '£' },
  ];

  advanceStep(): void {
    if (this.wizardStep() < 4) {
      this.wizardStep.set(this.wizardStep() + 1);
    }
  }
}
