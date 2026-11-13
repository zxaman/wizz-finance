import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  BankPaymentMethod,
  CardPaymentMethod,
  PaymentMethodItem,
  WizzPlatformStore,
} from '@wizz/remittance-data-access';
import { AppShellComponent } from '@wizz/remittance-shell';
import {
  SelectOption,
  ToastService,
  UiAccordionComponent,
  UiBadgeComponent,
  UiButtonComponent,
  UiDrawerComponent,
  UiEmptyStateComponent,
  UiInputComponent,
  UiModalComponent,
  UiPhoneInputComponent,
  UiSelectComponent,
  UiTabsComponent,
  WizzIconComponent,
} from '@wizz/ui';
import { maskAccountNumber } from '@wizz/utils';

type PaymentModal = null | 'micro-deposit' | 'small-charge' | 'remove-confirm' | 'remove-primary' | 'remove-pending' | 'leave-unsaved';

@Component({
  selector: 'app-payment-methods-page',
  standalone: true,
  imports: [
    FormsModule,
    AppShellComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiInputComponent,
    UiSelectComponent,
    UiPhoneInputComponent,
    UiDrawerComponent,
    UiModalComponent,
    UiTabsComponent,
    UiAccordionComponent,
    UiEmptyStateComponent,
    WizzIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wizz-app-shell>
      <div class="pm-header">
        <h1>Payment Methods</h1>
        <p class="sub">Manage your linked banks and cards for instant and scheduled payments.</p>
      </div>
      <wizz-tabs [tabs]="pmTabs" [(activeTab)]="activeTab" />
      @if (activeTab() === 'banks') {
        @if (store.banks().length === 0) {
          <wizz-empty-state icon="building" title="No Bank Accounts Linked" description="Add a bank account to receive payouts or fund your WIZZ Balance." >
            <wizz-button leadingIcon="plus" (clicked)="openAddDrawer('bank')">Add Bank Account</wizz-button>
          </wizz-empty-state>
        } @else {
          <div class="pm-grid">
            @for (bank of store.banks(); track bank.id) {
              <article class="pm-card" (click)="openBankDetails(bank)">
                <div class="pm-card-top">
                  <div class="pm-logo"><wizz-icon name="building" [size]="20" /></div>
                  <div class="pm-info"><strong>{{ bank.bankName }}</strong><small>{{ maskAccountNumber(bank.accountNumber, 'compact') }}</small></div>
                  @if (bank.isPrimary) { <wizz-badge tone="verified">Primary</wizz-badge> }
                </div>
              </article>
            }
          </div>
        }
      } @else {
        @if (store.cards().length === 0) {
          <wizz-empty-state icon="credit-card" title="No Cards Linked" description="Add a debit or credit card for instant payments." >
            <wizz-button leadingIcon="plus" (clicked)="openAddDrawer('card')">Add Card</wizz-button>
          </wizz-empty-state>
        } @else {
          <div class="pm-grid">
            @for (card of store.cards(); track card.id) {
              <article class="pm-card" (click)="openCardDetails(card)">
                <div class="pm-card-top">
                  <div class="pm-logo"><wizz-icon [name]="card.brand === 'visa' ? 'credit-card' : 'credit-card'" [size]="20" /></div>
                  <div class="pm-info"><strong>{{ card.brand }} {{ card.issuer }}</strong><small>•••• •••• •••• {{ card.last4 }}</small></div>
                  @if (card.isPrimary) { <wizz-badge tone="verified">Primary</wizz-badge> }
                </div>
              </article>
            }
          </div>
        }
      }
      <wizz-drawer [open]="showAddDrawer()" title="Add Payment Method" [width]="500" (closed)="attemptCloseAddDrawer()">
        @if (addMode() === 'bank') {
          <div class="drawer-stack">
            <wizz-select label="Country" [options]="countryOptions" [(value)]="bankCountry" />
            <wizz-input label="Bank Name" placeholder="Enter bank name" [(value)]="bankName" />
            <wizz-input label="Account Holder Name" placeholder="Enter name on account" [(value)]="bankHolderName" [error]="bankHolderError()" />
            <wizz-input label="Bank Account Number" placeholder="Enter bank account number" [(value)]="bankAccountNumber" />
            <wizz-input label="Routing Number" placeholder="Enter routing number" [(value)]="bankRoutingNumber" />
            <wizz-select label="Account Type" [options]="accountTypeOptions" [(value)]="bankAccountType" />
          </div>
        } @else {
          <div class="drawer-stack">
            <wizz-select label="Country" [options]="countryOptions" [(value)]="cardCountry" />
            <wizz-input label="Card Number" placeholder="0000 0000 0000 0000" [(value)]="cardNumber" />
            <div class="two-col"><wizz-input label="Expiry Date" type="date" [(value)]="cardExpiry" /><wizz-input label="CVV" placeholder="000" type="password" [(value)]="cardCvv" /></div>
            <wizz-input label="Cardholder Name" placeholder="Enter name on card" [(value)]="cardHolderName" />
            <wizz-input label="Billing Address" placeholder="Street, City, Zip" [(value)]="cardBillingAddress" />
            <div class="toggle-row"><span>Set as Primary Payment Method</span><input type="checkbox" [(ngModel)]="cardIsPrimary" /></div>
          </div>
        }
        <div drawer-footer><wizz-button [fullWidth]="true" (clicked)="submitAddMethod()">Link Payment Method</wizz-button></div>
      </wizz-drawer>
      <wizz-drawer [open]="!!selectedBank()" title="Bank Account Details" [width]="500" (closed)="selectedBank.set(null)">
        @if (selectedBank(); as bank) {
          <div class="drawer-stack">
            <div class="pm-logo-large"><wizz-icon name="building" [size]="32" /></div>
            <div class="pm-info-large"><strong>{{ bank.bankName }}</strong><span>{{ maskAccountNumber(bank.accountNumber, 'grouped') }}</span></div>
            <wizz-accordion title="ACCOUNT DETAILS">
              <div class="detail-grid">
                <div><small>Account Holder</small><strong>{{ bank.accountHolderName }}</strong></div>
                <div><small>Account Type</small><strong>{{ bank.accountType }}</strong></div>
                <div><small>Routing Number</small><strong>{{ bank.routingNumber }}</strong></div>
                <div><small>Country</small><strong>{{ bank.country }}</strong></div>
              </div>
            </wizz-accordion>
            @if (!bank.verified) {
              <div class="verify-banner"><wizz-icon name="alert-triangle" [size]="18" /><span>Micro-deposit verification pending</span></div>
              <wizz-button [fullWidth]="true" (clicked)="activeModal.set('micro-deposit')">Verify Now</wizz-button>
            }
            @if (bank.isPrimary) { <wizz-button variant="outline" [fullWidth]="true" (clicked)="toast.show('Already primary', 'info')">Set as Primary</wizz-button> }
            @else { <wizz-button [fullWidth]="true" (clicked)="setPrimaryBank(bank)">Set as Primary</wizz-button> }
            <wizz-button variant="danger-outline" [fullWidth]="true" (clicked)="activeModal.set('remove-confirm')">Remove Payment Method</wizz-button>
          </div>
        }
        <div drawer-footer><wizz-button variant="outline" (clicked)="selectedBank.set(null)">Close</wizz-button></div>
      </wizz-drawer>
      <wizz-drawer [open]="!!selectedCard()" title="Card Details" [width]="500" (closed)="selectedCard.set(null)">
        @if (selectedCard(); as card) {
          <div class="drawer-stack">
            <div class="pm-logo-large"><wizz-icon [name]="card.brand === 'visa' ? 'credit-card' : 'credit-card'" [size]="32" /></div>
            <div class="pm-info-large"><strong>{{ card.brand }} {{ card.issuer }}</strong><span>•••• •••• •••• {{ card.last4 }}</span></div>
            <wizz-accordion title="CARD DETAILS">
              <div class="detail-grid">
                <div><small>Cardholder Name</small><strong>{{ card.cardHolderName }}</strong></div>
                <div><small>Expiry Date</small><strong>{{ card.expiry }}</strong></div>
                <div><small>Billing Address</small><strong>{{ card.billingAddress.line1 }}, {{ card.billingAddress.city }}, {{ card.billingAddress.state }} {{ card.billingAddress.zipCode }}</strong></div>
                <div><small>Country</small><strong>{{ card.country }}</strong></div>
              </div>
            </wizz-accordion>
            @if (!card.verified) {
              <div class="verify-banner"><wizz-icon name="alert-triangle" [size]="18" /><span>Small charge verification pending</span></div>
              <wizz-button [fullWidth]="true" (clicked)="activeModal.set('small-charge')">Verify Now</wizz-button>
            }
            @if (card.isPrimary) { <wizz-button variant="outline" [fullWidth]="true" (clicked)="toast.show('Already primary', 'info')">Set as Primary</wizz-button> }
            @else { <wizz-button [fullWidth]="true" (clicked)="setPrimaryCard(card)">Set as Primary</wizz-button> }
            <wizz-button variant="danger-outline" [fullWidth]="true" (clicked)="activeModal.set('remove-confirm')">Remove Payment Method</wizz-button>
          </div>
        }
        <div drawer-footer><wizz-button variant="outline" (clicked)="selectedCard.set(null)">Close</wizz-button></div>
      </wizz-drawer>
      <wizz-modal [open]="activeModal() === 'micro-deposit'" tone="info" title="Verify Bank Account" subtitle="We've sent two micro-deposits (USD $0.03 &amp; $0.12) to your account. Please enter the amounts to verify." (closed)="activeModal.set(null)">
        <div class="drawer-stack"><wizz-input label="Deposit 1 Amount ($)" type="number" [(value)]="verifyAmt1" /><wizz-input label="Deposit 2 Amount ($)" type="number" [(value)]="verifyAmt2" /></div>
        <div drawer-footer><wizz-button variant="outline" [fullWidth]="true" (clicked)="activeModal.set(null)">Cancel</wizz-button><wizz-button [fullWidth]="true" (clicked)="completeMicroDeposit()">Confirm Amounts</wizz-button></div>
      </wizz-modal>
      <wizz-modal [open]="activeModal() === 'small-charge'" tone="info" title="Verify Card" subtitle="A small charge of $1.00 was placed on your card. Please enter the descriptor code from your bank statement." (closed)="activeModal.set(null)">
        <div class="drawer-stack"><wizz-input label="Descriptor Code" placeholder="WIZZ-1234" [(value)]="verifyCode" /></div>
        <div drawer-footer><wizz-button variant="outline" [fullWidth]="true" (clicked)="activeModal.set(null)">Cancel</wizz-button><wizz-button [fullWidth]="true" (clicked)="completeSmallCharge()">Confirm Code</wizz-button></div>
      </wizz-modal>
      <wizz-modal [open]="activeModal() === 'remove-confirm'" tone="warning" title="Remove Payment Method?" subtitle="Removing this method will prevent future instant payments. Are you sure?" (closed)="activeModal.set(null)">
        <div class="reason-stack"><span class="sec-label">Reason for Removal</span><wizz-select [options]="removeReasonOptions" [(value)]="removeReason" /></div>
        <div drawer-footer><wizz-button variant="outline" [fullWidth]="true" (clicked)="activeModal.set(null)">Cancel</wizz-button><wizz-button variant="danger" [fullWidth]="true" (clicked)="executeRemove()">Remove</wizz-button></div>
      </wizz-modal>
      <wizz-modal [open]="activeModal() === 'remove-primary'" tone="warning" title="Primary Method Guard" subtitle="You cannot remove your primary payment method. Please set another method as primary first." (closed)="activeModal.set(null)">
        <div drawer-footer><wizz-button [fullWidth]="true" (clicked)="activeModal.set(null)">Got It</wizz-button></div>
      </wizz-modal>
      <wizz-modal [open]="activeModal() === 'remove-pending'" tone="warning" title="Pending Transaction Guard" subtitle="This method is linked to an active transaction (Ref: TX-88291). Please cancel the transaction first." (closed)="activeModal.set(null)">
        <div drawer-footer><wizz-button [fullWidth]="true" (clicked)="activeModal.set(null)">Got It</wizz-button></div>
      </wizz-modal>
      <wizz-modal [open]="activeModal() === 'leave-unsaved'" tone="warning" title="Discard Payment Method?" subtitle="Your unsaved payment method details will be lost." (closed)="activeModal.set(null)">
        <div drawer-footer>
          <wizz-button variant="outline" [fullWidth]="true" (clicked)="activeModal.set(null)">Keep Editing</wizz-button>
          <wizz-button variant="danger" [fullWidth]="true" (clicked)="discardAddMethod()">Discard</wizz-button>
        </div>
      </wizz-modal>
    </wizz-app-shell>
  `,
  styles: [
    `
      .pm-header { margin-bottom: 24px; }
      .pm-header h1 { margin: 0; font-size: 1.45rem; font-weight: 800; }
      .sub { margin: 4px 0 0; font-size: 0.84rem; color: var(--wizz-text-secondary); }
      .pm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: 16px; }
      .pm-card { border: 1px solid var(--wizz-border); border-radius: 14px; padding: 16px 18px; background: #ffffff; cursor: pointer; transition: all 0.16s ease; }
      .pm-card:hover { border-color: var(--wizz-primary); box-shadow: var(--wizz-shadow-sm); transform: translateY(-2px); }
      .pm-card-top { display: flex; align-items: center; gap: 10px; }
      .pm-logo { width: 40px; height: 40px; border-radius: 10px; background: var(--wizz-surface-muted); display: inline-flex; align-items: center; justify-content: center; color: var(--wizz-text); }
      .pm-info strong { display: block; font-size: 0.88rem; }
      .pm-info small { font-size: 0.74rem; color: var(--wizz-text-muted); }
      .drawer-stack { display: flex; flex-direction: column; gap: 13px; }
      .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; font-size: 0.84rem; }
      .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .detail-grid small { display: block; font-size: 0.7rem; color: var(--wizz-text-muted); margin-bottom: 2px; }
      .detail-grid strong { font-size: 0.8rem; }
      .pm-logo-large { width: 60px; height: 60px; border-radius: 12px; background: var(--wizz-surface-muted); display: inline-flex; align-items: center; justify-content: center; color: var(--wizz-text); margin-bottom: 10px; }
      .pm-info-large strong { display: block; font-size: 1.05rem; }
      .pm-info-large span { font-size: 0.82rem; color: var(--wizz-text-muted); }
      .verify-banner { display: flex; align-items: center; gap: 8px; padding: 12px; border-radius: 10px; background: var(--wizz-surface-muted); font-size: 0.82rem; color: var(--wizz-amber-dark); }
      .reason-stack { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
      .sec-label { font-size: 0.7rem; font-weight: 700; color: var(--wizz-text-muted); }
      @media (max-width: 480px) {
        .pm-header { display: flex; flex-direction: column; align-items: stretch; gap: 12px; }
        .two-col, .detail-grid { grid-template-columns: 1fr; }
        .verify-banner { align-items: flex-start; }
      }
    `,
  ],
})
export class PaymentMethodsPageComponent {
  protected readonly store = inject(WizzPlatformStore);
  protected readonly maskAccountNumber = maskAccountNumber;
  private readonly router = inject(Router);
  protected readonly toast = inject(ToastService);
  protected readonly countryOptions: readonly SelectOption[] = [{ value: 'United States', label: 'United States' }, { value: 'United Kingdom', label: 'United Kingdom' }, { value: 'India', label: 'India' }, { value: 'United Arab Emirates', label: 'United Arab Emirates' }];
  protected readonly accountTypeOptions: readonly SelectOption[] = [{ value: 'Savings Account', label: 'Savings Account' }, { value: 'Checking Account', label: 'Checking Account' }];
  protected readonly removeReasonOptions: readonly SelectOption[] = [{ value: 'duplicate', label: 'Duplicate Method' }, { value: 'unused', label: 'Unused' }, { value: 'security', label: 'Security / Fraud' }, { value: 'other', label: 'Other' }];
  readonly pmTabs = [{ id: 'banks', label: 'Banks' }, { id: 'cards', label: 'Cards' }];
  readonly activeTab = signal<'banks' | 'cards'>('banks');
  readonly showAddDrawer = signal(false);
  readonly addMode = signal<'bank' | 'card'>('bank');
  readonly bankCountry = signal('United States');
  readonly bankName = signal('');
  readonly bankHolderName = signal('');
  readonly bankAccountNumber = signal('');
  readonly bankRoutingNumber = signal('');
  readonly bankAccountType = signal<'Savings Account' | 'Checking Account'>('Savings Account');
  readonly bankHolderError = signal('');
  readonly cardCountry = signal('United States');
  readonly cardNumber = signal('');
  readonly cardExpiry = signal('');
  readonly cardCvv = signal('');
  readonly cardHolderName = signal('');
  readonly cardBillingAddress = signal('');
  readonly cardIsPrimary = signal(false);
  readonly selectedBank = signal<BankPaymentMethod | null>(null);
  readonly selectedCard = signal<CardPaymentMethod | null>(null);
  readonly activeModal = signal<PaymentModal>(null);
  readonly removeReason = signal<'duplicate' | 'unused' | 'security' | 'other'>('unused');
  readonly verifyAmt1 = signal('0.03');
  readonly verifyAmt2 = signal('0.12');
  readonly verifyCode = signal('');

  attemptCloseAddDrawer(): void {
    if ((this.addMode() === 'bank' && (this.bankName() || this.bankAccountNumber() || this.bankHolderName())) || (this.addMode() === 'card' && (this.cardNumber() || this.cardHolderName() || this.cardBillingAddress()))) {
      this.activeModal.set('leave-unsaved');
    } else {
      this.showAddDrawer.set(false);
    }
  }

  openAddDrawer(mode: 'bank' | 'card'): void {
    this.addMode.set(mode);
    this.showAddDrawer.set(true);
  }

  discardAddMethod(): void {
    this.activeModal.set(null);
    this.showAddDrawer.set(false);
    this.bankName.set('');
    this.bankHolderName.set('');
    this.bankAccountNumber.set('');
    this.bankRoutingNumber.set('');
    this.cardNumber.set('');
    this.cardExpiry.set('');
    this.cardCvv.set('');
    this.cardHolderName.set('');
    this.cardBillingAddress.set('');
  }

  submitAddMethod(): void {
    if (this.addMode() === 'bank') {
      if (!this.bankHolderName().trim()) { this.bankHolderError.set('Account holder name must match'); return; }
      this.store.addBankMethod({ bankName: this.bankName() || 'Linked Bank', accountHolderName: this.bankHolderName().trim(), accountNumber: this.bankAccountNumber().trim(), routingNumber: this.bankRoutingNumber().trim(), accountType: this.bankAccountType(), country: this.bankCountry(), setAsDefault: this.store.banks().length === 0 });
    } else {
      this.store.addCardMethod({ country: this.cardCountry(), issuer: 'Visa / Mastercard', cardHolderName: this.cardHolderName().trim(), cardNumber: this.cardNumber(), expiry: this.cardExpiry(), brand: 'visa', billingAddress: { country: this.cardCountry(), line1: this.cardBillingAddress(), line2: '', city: '', state: '', zipCode: '' }, setAsDefault: this.cardIsPrimary() });
    }
    this.showAddDrawer.set(false);
    this.toast.show('Payment method added successfully', 'success');
  }

  openBankDetails(bank: BankPaymentMethod): void { this.selectedBank.set(bank); }
  openCardDetails(card: CardPaymentMethod): void { this.selectedCard.set(card); }
  setPrimaryBank(bank: PaymentMethodItem): void { this.store.forceSetPrimaryPaymentMethod(bank.id); this.toast.show('Bank set as primary', 'success'); this.selectedBank.set(null); }
  setPrimaryCard(card: PaymentMethodItem): void { this.store.forceSetPrimaryPaymentMethod(card.id); this.toast.show('Card set as primary', 'success'); this.selectedCard.set(null); }
  completeMicroDeposit(): void { const b = this.selectedBank(); if (b) { this.store.verifyPaymentMethod(b.id); this.toast.show('Bank account verified successfully', 'success'); } this.activeModal.set(null); }
  completeSmallCharge(): void { const c = this.selectedCard(); if (c) { this.store.verifyPaymentMethod(c.id); this.toast.show('Card verified successfully', 'success'); } this.activeModal.set(null); }
  executeRemove(): void {
    const item = this.selectedBank() || this.selectedCard();
    if (!item) return;
    if (item.isPrimary) { this.activeModal.set('remove-primary'); return; }
    if (item.hasPendingTx) { this.activeModal.set('remove-pending'); return; }
    const type = item.kind === 'bank' ? 'bank' : 'card';
    const id = item.id;
    this.store.removePaymentMethod(id);
    this.activeModal.set(null);
    this.selectedBank.set(null);
    this.selectedCard.set(null);
    this.toast.show('Payment method removed', 'success');
  }
}
