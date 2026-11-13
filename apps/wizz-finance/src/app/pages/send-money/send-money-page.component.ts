import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  BeneficiaryItem,
  PaymentMethodItem,
  RemittanceTransaction,
  WizzPlatformStore,
} from '@wizz/remittance-data-access';
import { AppShellComponent } from '@wizz/remittance-shell';
import {
  SelectOption,
  ToastService,
  UiBadgeComponent,
  UiButtonComponent,
  UiDrawerComponent,
  UiInputComponent,
  UiModalComponent,
  UiSelectComponent,
  UiStepperComponent,
  WizzIconComponent,
} from '@wizz/ui';
import { COUNTRIES, CURRENCIES, formatMoney, maskAccountNumber, SelectOption as UtilsSelectOption } from '@wizz/utils';

type SendModal = null | 'send-from-unverified' | 'fx-changed' | 'under-review' | 'failure' | 'receipt';

@Component({
  selector: 'app-send-money-page',
  standalone: true,
  imports: [
    AppShellComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiInputComponent,
    UiSelectComponent,
    UiDrawerComponent,
    UiModalComponent,
    UiStepperComponent,
    WizzIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wizz-app-shell>
      <div class="send-header"><h1>Make a Payment</h1><p class="sub">Send money securely to your beneficiaries worldwide.</p></div>
      <wizz-stepper [steps]="wizardSteps" [activeIndex]="wizardStep()" />
      @if (wizardStep() === 0) {
        <div class="drawer-stack">
          <div class="fx-hero">
            <div class="fx-row"><span>Sending</span><wizz-input type="number" prefix="$" [(value)]="sendAmount" (input)="recalcFx()" /><span>USD</span></div>
            <div class="fx-arrow"><wizz-icon name="arrow-right" [size]="20" /></div>
            <div class="fx-row"><span>Receiving</span><wizz-input type="number" prefix="₹" [(value)]="receiveAmount" (input)="recalcFx()" /><wizz-select [options]="currencyOptions" [(value)]="receiveCurrency" /></div>
          </div>
          <div class="fx-breakdown">
            <div class="fx-row-sm"><span>Live FX Rate</span><strong>1 USD = {{ fxRate() }} {{ receiveCurrency() }}</strong></div>
            <div class="fx-row-sm"><span>Transaction Fee</span><strong>${{ feeUsd() }}</strong></div>
            <div class="fx-row-sm"><span>Total Amount</span><strong>${{ totalSendUsd() }}</strong></div>
          </div>
          <div class="fx-warning"><wizz-icon name="alert-circle" [size]="16" /><span>FX rates lock for 30 seconds after proceeding.</span></div>
          <div drawer-footer><wizz-button [fullWidth]="true" (clicked)="advanceStep()">Continue</wizz-button></div>
        </div>
      }
      @if (wizardStep() === 1) {
        <div class="drawer-stack">
          <div class="search-box"><input type="text" placeholder="Search beneficiaries or add new..." [ngModel]="beneficiarySearch()" (ngModelChange)="beneficiarySearch.set($event)" /><wizz-icon name="search" [size]="16" /></div>
          @if (filteredBeneficiaries().length === 0) {
            <wizz-empty-state icon="user" title="No Beneficiary Found" description="Try searching by name, email, or phone. Or add a new beneficiary." >
              <wizz-button leadingIcon="plus" (clicked)="openAddBeneficiary()">Add New Beneficiary</wizz-button>
            </wizz-empty-state>
          } @else {
            <div class="ben-list">
              @for (ben of filteredBeneficiaries(); track ben.id) {
                <div class="ben-item" [class.ben-item--selected]="selectedBeneficiary()?.id === ben.id" (click)="selectBeneficiary(ben)">
                  <div class="ben-ident"><span class="ben-avatar">{{ initials(ben.firstName + ' ' + ben.lastName) }}</span><div><strong>{{ ben.firstName }} {{ ben.lastName }}</strong><small>{{ ben.bank.bankName }} · {{ maskAccountNumber(ben.bank.accountNumber, 'compact') }}</small></div></div>
                  <wizz-icon [name]="selectedBeneficiary()?.id === ben.id ? 'check-circle' : 'radio'" [size]="20" />
                </div>
              }
            </div>
          }
        </div>
        <div drawer-footer>@if (selectedBeneficiary()) { <wizz-button [fullWidth]="true" (clicked)="advanceStep()">Continue</wizz-button> }</div>
      }
      @if (wizardStep() === 2) {
        <div class="drawer-stack">
          <div class="send-from-grid">
            <div class="send-from-card" [class.send-from-card--selected]="selectedSource() === 'balance'" (click)="selectSource('balance')"><wizz-icon name="wallet" [size]="24" /><div><strong>WIZZ Balance</strong><small>{{ formatMoneyFn(store.availableWalletUsd(), 'USD') }}</small></div></div>
            @for (bank of store.bankMethods(); track bank.id) {
              <div class="send-from-card" [class.send-from-card--selected]="selectedSource() === ('bank-' + bank.id)" (click)="selectSource('bank-' + bank.id)"><wizz-icon name="building" [size]="24" /><div><strong>{{ bank.bankName }}</strong><small>{{ maskAccountNumber(bank.accountNumber, 'compact') }}</small></div>@if (bank.isPrimary) { <wizz-badge tone="verified">Primary</wizz-badge> }</div>
            }
            @for (card of store.cardMethods(); track card.id) {
              <div class="send-from-card" [class.send-from-card--selected]="selectedSource() === ('card-' + card.id)" (click)="selectSource('card-' + card.id)"><wizz-icon [name]="card.brand === 'Visa' ? 'credit-card' : 'credit-card'" [size]="24" /><div><strong>{{ card.brand }} {{ card.type }}</strong><small>{{ maskAccountNumber(card.accountNumber, 'compact') }}</small></div>@if (card.isPrimary) { <wizz-badge tone="verified">Primary</wizz-badge> }</div>
            }
          </div>
        </div>
        <div drawer-footer>@if (selectedSource()) { <wizz-button [fullWidth]="true" (clicked)="advanceStep()">Continue</wizz-button> }</div>
      }
      @if (wizardStep() === 3) {
        <div class="drawer-stack">
          <wizz-select label="Purpose of Payment" [options]="purposeOptions" [(value)]="purpose" />
          <wizz-input label="Description / Reference" placeholder="e.g. Invoice #1234" [(value)]="description" />
        </div>
        <div drawer-footer><wizz-button [fullWidth]="true" (clicked)="advanceStep()">Continue</wizz-button></div>
      }
      @if (wizardStep() === 4) {
        <div class="drawer-stack">
          <div class="review-header"><strong>Review Transaction</strong><small>Compliance Summary</small></div>
          <div class="review-grid">
            <div><small>Sending</small><strong>${{ totalSendUsd() }} USD</strong></div>
            <div><small>Receiving</small><strong>{{ receiveAmount() }} {{ receiveCurrency() }}</strong></div>
            <div><small>Beneficiary</small><strong>{{ selectedBeneficiary()?.firstName }} {{ selectedBeneficiary()?.lastName }}</strong></div>
            <div><small>Source</small><strong>{{ sourceLabel() }}</strong></div>
            <div><small>Purpose</small><strong>{{ purpose() }}</strong></div>
            <div><small>Reference</small><strong>{{ description() }}</strong></div>
          </div>
          <div class="compliance-consent"><label class="chk-row"><input type="checkbox" [(ngModel)]="consent" /><span>I agree to the Terms &amp; Conditions and Compliance Policy.</span></label></div>
        </div>
        <div drawer-footer><wizz-button variant="outline" [fullWidth]="true" (clicked)="wizardStep.set(3)">Back</wizz-button><wizz-button [fullWidth]="true" (clicked)="submitTransaction()">Confirm &amp; Send</wizz-button></div>
      }
      <wizz-modal [open]="activeModal() === 'send-from-unverified'" tone="warning" title="Unverified Payment Method" subtitle="The selected payment method is unverified. Please verify it first or choose another." (closed)="activeModal.set(null)">
        <div drawer-footer><wizz-button [fullWidth]="true" (clicked)="activeModal.set(null)">Got It</wizz-button></div>
      </wizz-modal>
      <wizz-modal [open]="activeModal() === 'fx-changed'" tone="warning" title="FX Rate Changed" subtitle="The exchange rate shifted during processing. The new total is ${{ newTotalUsd() }} USD." (closed)="activeModal.set(null)">
        <div drawer-footer><wizz-button variant="outline" [fullWidth]="true" (clicked)="activeModal.set(null); submitTransaction()">Accept New Rate</wizz-button><wizz-button variant="danger-outline" [fullWidth]="true" (clicked)="activeModal.set(null)">Cancel Transaction</wizz-button></div>
      </wizz-modal>
      <wizz-modal [open]="activeModal() === 'under-review'" tone="info" title="Transaction Under Review" subtitle="Our compliance team is reviewing your transfer. You will be notified shortly." (closed)="activeModal.set(null)">
        <div drawer-footer><wizz-button [fullWidth]="true" (clicked)="activeModal.set(null); go('/payments')">View Payments</wizz-button></div>
      </wizz-modal>
      <wizz-modal [open]="activeModal() === 'failure'" tone="danger" title="Transaction Failed" subtitle="The transfer could not be processed. Please check your source balance or try again later." (closed)="activeModal.set(null)">
        <div drawer-footer><wizz-button [fullWidth]="true" (clicked)="activeModal.set(null); wizardStep.set(0)">Try Again</wizz-button></div>
      </wizz-modal>
      <wizz-modal [open]="activeModal() === 'receipt'" tone="verified" title="Transaction Request Received" subtitle="Reference: {{ receiptId() }} | Status: Processing" (closed)="activeModal.set(null)">
        <div class="receipt-stack">
          <div class="receipt-amount"><span>Amount Delivered</span><strong>{{ receiveAmount() }} {{ receiveCurrency() }}</strong><wizz-badge tone="pending">Processing</wizz-badge></div>
          <div class="kv-row"><span>Beneficiary</span><strong>{{ selectedBeneficiary()?.firstName }} {{ selectedBeneficiary()?.lastName }}</strong></div>
          <div class="kv-row"><span>Source</span><strong>{{ sourceLabel() }}</strong></div>
          <div class="kv-row"><span>Purpose</span><strong>{{ purpose() }}</strong></div>
          <div class="kv-row"><span>Reference</span><strong>{{ description() }}</strong></div>
        </div>
        <div drawer-footer><wizz-button [fullWidth]="true" (clicked)="activeModal.set(null); go('/payments')">View Payments</wizz-button></div>
      </wizz-modal>
    </wizz-app-shell>
  `,
  styles: [
    `
      .send-header { margin-bottom: 24px; }
      .send-header h1 { margin: 0; font-size: 1.45rem; font-weight: 800; }
      .sub { margin: 4px 0 0; font-size: 0.84rem; color: var(--wizz-text-secondary); }
      .drawer-stack { display: flex; flex-direction: column; gap: 16px; }
      .fx-hero { display: flex; align-items: center; justify-content: space-between; padding: 20px; border-radius: 14px; background: var(--wizz-surface-muted); }
      .fx-row { display: flex; align-items: center; gap: 8px; flex: 1; }
      .fx-row input { flex: 1; border: none; outline: none; font-size: 1.35rem; font-weight: 800; }
      .fx-arrow { color: var(--wizz-text-muted); }
      .fx-breakdown { display: flex; flex-direction: column; gap: 8px; padding: 14px; border-radius: 10px; background: #ffffff; border: 1px solid var(--wizz-border); }
      .fx-row-sm { display: flex; justify-content: space-between; font-size: 0.82rem; }
      .fx-row-sm strong { font-weight: 700; }
      .fx-warning { display: flex; align-items: center; gap: 6px; padding: 10px; border-radius: 8px; background: var(--wizz-amber-soft); color: var(--wizz-amber-dark); font-size: 0.78rem; }
      .search-box { display: flex; align-items: center; height: 40px; padding: 0 12px; border-radius: 10px; border: 1px solid var(--wizz-border-strong); background: #ffffff; }
      .search-box input { flex: 1; border: none; outline: none; font-size: 0.82rem; }
      .ben-list { display: flex; flex-direction: column; gap: 8px; }
      .ben-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; border-radius: 10px; border: 1px solid var(--wizz-border); cursor: pointer; }
      .ben-item:hover { background: var(--wizz-surface-muted); }
      .ben-item--selected { background: var(--wizz-primary-soft); border-color: var(--wizz-primary); }
      .ben-ident { display: flex; align-items: center; gap: 9px; }
      .ben-avatar { width: 30px; height: 30px; border-radius: 50%; background: #dfe3fa; color: #4b3fd6; font-size: 0.72rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; }
      .ben-ident strong { font-size: 0.85rem; }
      .ben-ident small { font-size: 0.72rem; color: var(--wizz-text-muted); }
      .send-from-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .send-from-card { display: flex; align-items: center; gap: 10px; padding: 14px; border-radius: 10px; border: 1px solid var(--wizz-border); background: #ffffff; cursor: pointer; }
      .send-from-card:hover { border-color: var(--wizz-primary); }
      .send-from-card--selected { background: var(--wizz-primary-soft); border-color: var(--wizz-primary); }
      .send-from-card wizz-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--wizz-surface-muted); display: inline-flex; align-items: center; justify-content: center; }
      .send-from-card strong { display: block; font-size: 0.85rem; }
      .send-from-card small { font-size: 0.72rem; color: var(--wizz-text-muted); }
      .review-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--wizz-border); }
      .review-header strong { font-size: 1.05rem; }
      .review-header small { color: var(--wizz-text-muted); }
      .review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .review-grid small { display: block; font-size: 0.7rem; color: var(--wizz-text-muted); margin-bottom: 2px; }
      .review-grid strong { font-size: 0.82rem; }
      .compliance-consent { display: flex; align-items: center; gap: 8px; padding: 12px; border-radius: 10px; background: var(--wizz-surface-muted); font-size: 0.8rem; }
      .chk-row input { width: 16px; height: 16px; accent-color: var(--wizz-primary); }
      .receipt-stack { display: flex; flex-direction: column; gap: 14px; }
      .receipt-amount { padding: 20px; border-radius: 14px; background: var(--wizz-surface-muted); display: flex; align-items: center; justify-content: space-between; }
      .receipt-amount strong { font-size: 1.5rem; }
      .kv-row { display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--wizz-border); font-size: 0.84rem; }
      .kv-row span { color: var(--wizz-text-muted); }
    `,
  ],
})
export class SendMoneyPageComponent {
  protected readonly store = inject(WizzPlatformStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly initials = (name: string) => name.split(' ').map(n => n[0] || '').join('').toUpperCase().substring(0, 2);
  protected readonly formatMoneyFn = formatMoney;
  protected readonly wizardSteps = [{ id: 'amount', label: 'Amount' }, { id: 'beneficiary', label: 'Beneficiary' }, { id: 'source', label: 'Source' }, { id: 'details', label: 'Details' }, { id: 'review', label: 'Review' }];
  protected readonly currencyOptions: readonly SelectOption[] = CURRENCIES.map(c => ({ value: c.code, label: c.name, prefix: c.symbol }));
  protected readonly purposeOptions: readonly SelectOption[] = [{ value: 'goods', label: 'Goods / Services' }, { value: 'family', label: 'Family Support' }, { value: 'investment', label: 'Investment' }, { value: 'other', label: 'Other' }];
  readonly wizardStep = signal(0);
  readonly activeModal = signal<SendModal>(null);
  readonly consent = signal(false);
  readonly receiptId = signal('');
  readonly sendAmount = signal('100');
  readonly receiveAmount = signal('8626.40');
  readonly receiveCurrency = signal<'INR' | 'AED' | 'GBP'>('INR');
  readonly fxRate = signal(86.264);
  readonly feeUsd = signal(3.45);
  readonly beneficiarySearch = signal('');
  readonly selectedBeneficiary = signal<BeneficiaryItem | null>(null);
  readonly selectedSource = signal<'balance' | string>(this.store.bankMethods().length > 0 ? 'bank-' + this.store.bankMethods()[0].id : 'balance');
  readonly purpose = signal<'goods' | 'family' | 'investment' | 'other'>('goods');
  readonly description = signal('Invoice #1234 Payment');
  readonly totalSendUsd = computed(() => { const amt = Number(this.sendAmount()) || 0; return amt + this.feeUsd(); });
  readonly newTotalUsd = computed(() => this.totalSendUsd() * 1.02);
  readonly filteredBeneficiaries = computed(() => {
    const q = this.beneficiarySearch().trim().toLowerCase();
    if (!q) return this.store.beneficiaries();
    return this.store.beneficiaries().filter(b => (`${b.firstName} ${b.lastName}`.toLowerCase().includes(q) || b.email.toLowerCase().includes(q)));
  });
  readonly sourceLabel = computed(() => {
    const src = this.selectedSource();
    if (src === 'balance') return 'WIZZ Balance';
    const parts = src.split('-');
    if (parts[0] === 'bank') {
      const b = this.store.bankMethods().find(x => x.id === parts[1]);
      return b ? `${b.bankName} (${maskAccountNumber(b.accountNumber, 'compact')})` : '';
    }
    if (parts[0] === 'card') {
      const c = this.store.cardMethods().find(x => x.id === parts[1]);
      return c ? `${c.brand} ${c.type} (•••• •••• •••• ${c.last4})` : '';
    }
    return '';
  });
  recalcFx(): void {
    const amt = Number(this.sendAmount()) || 0;
    this.receiveAmount.set((amt * this.fxRate()).toFixed(2));
  }
  advanceStep(): void {
    if (this.wizardStep() === 2) {
      const src = this.selectedSource();
      if (src !== 'balance') {
        const parts = src.split('-');
        const type = parts[0];
        const id = parts[1];
        const item = type === 'bank' ? this.store.bankMethods().find(x => x.id === id) : this.store.cardMethods().find(x => x.id === id);
        if (item && !item.isVerified) { this.activeModal.set('send-from-unverified'); return; }
      }
    }
    if (this.wizardStep() < 4) this.wizardStep.update(s => s + 1);
  }
  selectBeneficiary(ben: BeneficiaryItem): void { this.selectedBeneficiary.set(ben); }
  openAddBeneficiary(): void { this.router.navigate(['/beneficiaries'], { queryParams: { action: 'add' } }); }
  selectSource(src: 'balance' | string): void { this.selectedSource.set(src); }
  submitTransaction(): void {
    if (!this.consent()) { this.toast.show('Please accept the terms and compliance policy', 'warning'); return; }
    const shifted = Math.random() > 0.8;
    if (shifted) { this.activeModal.set('fx-changed'); return; }
    const success = Math.random() > 0.1;
    if (!success) { this.activeModal.set('failure'); return; }
    const tx: RemittanceTransaction = {
      id: 'TX-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      date: new Date().toISOString().split('T')[0],
      type: 'International Transfer',
      currencyFlag: '₹',
      displayCurrency: 'INR',
      displayAmount: this.receiveAmount(),
      sendCurrency: 'USD',
      sendAmount: Number(this.sendAmount()),
      receiveCurrency: this.receiveCurrency(),
      feeUsd: this.feeUsd(),
      fxRateText: `1 USD = ${this.fxRate()} ${this.receiveCurrency()}`,
      purpose: this.purpose(),
      status: 'Under Review',
      beneficiaryName: `${this.selectedBeneficiary()?.firstName} ${this.selectedBeneficiary()?.lastName}`,
    };
    this.store.transactions.update(arr => [tx, ...arr]);
    this.receiptId.set(tx.id);
    this.activeModal.set('receipt');
    this.wizardStep.set(0);
    this.consent.set(false);
  }
  go(path: string): void { this.router.navigate([path]); }
}
