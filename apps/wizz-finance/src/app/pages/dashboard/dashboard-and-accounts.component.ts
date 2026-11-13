import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  DashboardExperienceMode,
  RemittanceTransaction,
  WizzPlatformStore,
} from '@wizz/remittance-data-access';
import { AppShellComponent } from '@wizz/remittance-shell';
import {
  TabOption,
  ToastService,
  UiBadgeComponent,
  UiButtonComponent,
  UiDrawerComponent,
  UiEmptyStateComponent,
  UiInputComponent,
  UiModalComponent,
  UiTabsComponent,
  WizzIconComponent,
} from '@wizz/ui';
import { formatMoney } from '@wizz/utils';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    RouterLink,
    AppShellComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiTabsComponent,
    UiEmptyStateComponent,
    UiInputComponent,
    UiModalComponent,
    WizzIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wizz-app-shell>
      <div class="state-switcher-bar">
        <span class="switcher-title">Dashboard Experience:</span>
        <div class="switcher-pills">
          <button type="button" class="sw-pill" [class.sw-pill--active]="store.dashboardMode() === 'active'" (click)="setMode('active')">Active Overview (05/24)</button>
          <button type="button" class="sw-pill" [class.sw-pill--active]="store.dashboardMode() === 'welcome'" (click)="setMode('welcome')">Welcome Empty State (24)</button>
          <button type="button" class="sw-pill" [class.sw-pill--active]="store.dashboardMode() === 'under_verification'" (click)="setMode('under_verification')">Under Verification (13)</button>
        </div>
      </div>

      @switch (store.dashboardMode()) {
        @case ('under_verification') {
          <section class="dash-section">
            <h1 class="page-title">Overview</h1>
            <div class="verification-hero-banner">
              <div class="verif-left">
                <span class="verif-icon"><wizz-icon name="search" [size]="20" /></span>
                <div>
                  <h2>Your details are under verification</h2>
                  <p>We've received your information and our team is reviewing it. This usually takes 2–3 business days. You'll be notified once everything is ready.</p>
                </div>
              </div>
              <div class="verif-id-card">
                <span class="verif-avatar">{{ store.user().firstName[0] }}</span>
                <div><strong>{{ store.fullName() }}</strong><small>Verification Pending</small></div>
              </div>
            </div>
            <h3 class="section-heading">Effortless Money Movement, Made for You</h3>
            <div class="promo-three-grid">
              <div class="info-card">
                <span class="info-emoji">🌍</span><h4>Local Accounts in Global Currencies</h4><p>Accept payments in various currencies easily with virtual account numbers.</p>
              </div>
              <div class="info-card">
                <span class="info-emoji">⚡</span><h4>Seamless Cross-Border Payments</h4><p>Transfer money quickly and affordably with our global network, fast and fuss-free.</p>
              </div>
              <div class="info-card">
                <span class="info-emoji">💱</span><h4>Transparent FX Rates</h4><p>We show you exactly what you're paying in real-time, with competitive exchange rates.</p>
              </div>
            </div>
          </section>
        }
        @case ('welcome') {
          <section class="dash-section">
            <h1 class="page-title">Hey Vikram, Welcome to PayGate</h1>
            <div class="welcome-cards-grid">
              <article class="welcome-card">
                <div class="welcome-visual welcome-visual--dark">@if (store.paymentMethods().length > 0) { <span class="completed-tag">Completed</span> }<span>💳 🏦</span></div>
                <h3>Link Your Payment Method</h3><p>Connect a card or bank account to enable smooth, instant payments from anywhere.</p>
                <a routerLink="/payment-methods" class="card-cta">Link More Payment Methods <wizz-icon name="arrow-right" [size]="14" /></a>
              </article>
              <article class="welcome-card">
                <div class="welcome-visual welcome-visual--purple"><span>👥 🌐</span></div>
                <h3>Add Beneficiary</h3><p>Set up a beneficiary to begin sending payments with just a few clicks.</p>
                <a routerLink="/beneficiaries" [queryParams]="{ action: 'add' }" class="card-cta">Add Beneficiary Now <wizz-icon name="arrow-right" [size]="14" /></a>
              </article>
              <article class="welcome-card">
                <div class="welcome-visual welcome-visual--soft"><span>💸 🚀</span></div>
                <h3>Send First Payment</h3><p>Add a beneficiary &amp; Payment Method to send or schedule payments anytime.</p>
                <a routerLink="/send-money" class="card-cta">Send Money Now <wizz-icon name="arrow-right" [size]="14" /></a>
              </article>
            </div>
            <div class="total-balance-banner">
              <div>
                <span class="bal-caption">TOTAL AVAILABLE BALANCE · USD</span>
                <div class="bal-amount-row"><strong class="big-balance">$00.00</strong></div>
              </div>
              <div class="bal-actions">
                <wizz-button variant="secondary" size="sm" leadingIcon="plus-circle" (clicked)="showAddFundsModal.set(true)">Add Funds</wizz-button>
                <wizz-button size="sm" leadingIcon="arrow-left-right" (clicked)="go('/send-money')">Transfer</wizz-button>
              </div>
            </div>
            <h3 class="section-heading">My Balances</h3>
            <div class="currency-grid">
              <div class="curr-card">
                <span class="curr-flag">🇺🇸</span><span class="curr-name">US Dollars</span><strong class="curr-val">$00.00</strong><small>100% of total balance</small>
              </div>
            </div>
            <div class="recent-head">
              <h3 class="section-heading m-0">Recent Payments</h3><a routerLink="/payments" class="view-all-link">View All &gt;</a>
            </div>
            <div class="table-box">
              <wizz-empty-state icon="banknote" title="No Transactions made yet" description="Your transactions appear here once you initiate your first payment." >
                <wizz-button size="sm" (clicked)="go('/send-money')">Make a Payment</wizz-button>
              </wizz-empty-state>
            </div>
          </section>
        }
        @default {
          <section class="dash-section">
            <h1 class="page-title">Overview</h1>
            <wizz-tabs [tabs]="overviewTabs()" [(activeTab)]="balanceTab" />
            <div class="total-balance-banner">
              <div>
                <span class="bal-caption">TOTAL AVAILABLE BALANCE · USD</span>
                <div class="bal-amount-row">
                  <strong class="big-balance">{{ balanceTab() === 'available' ? '$551,091.12' : formatUsd(store.inTransitUsd() || 62182.65) }}</strong>
                  <span class="growth-tag">↑ 16.64% <small>Since Last Month</small></span>
                </div>
              </div>
              <div class="bal-actions">
                <wizz-button variant="secondary" size="sm" leadingIcon="plus-circle" (clicked)="showAddFundsModal.set(true)">Add Funds</wizz-button>
                <wizz-button variant="secondary" size="sm" leadingIcon="arrow-down-left" (clicked)="toast.show('Withdrawal initiated to primary Chase Bank account', 'success')">Withdraw</wizz-button>
                <wizz-button variant="dark" size="sm" leadingIcon="arrow-left-right" (clicked)="go('/send-money')">Transfer</wizz-button>
              </div>
            </div>
            <div class="recent-head">
              <h3 class="section-heading m-0">My Balances</h3><a routerLink="/receiving-accounts" class="view-all-link">Local Accounts &gt;</a>
            </div>
            <div class="currency-grid">
              @for (b of store.balances(); track b.currency) {
                <div class="curr-card">
                  <span class="curr-flag">{{ b.flag }}</span><span class="curr-name">{{ b.label }}</span><strong class="curr-val">{{ formatMoneyFn(b.amount, b.currency) }}</strong><small>{{ b.shareOfTotal }}</small>
                </div>
              }
            </div>
            <div class="recent-head">
              <h3 class="section-heading m-0">Recent Payments</h3><a routerLink="/payments" class="view-all-link">View All &gt;</a>
            </div>
            <div class="table-box">
              <table class="tx-table">
                <thead>
                  <tr><th>Date</th><th>Type</th><th>Currency</th><th>Amount</th><th>Status</th></tr>
                </thead>
                <tbody>
                  @for (tx of visibleTransactions(); track tx.id) {
                    <tr (click)="go('/payments')">
                      <td>{{ tx.date }}</td>
                      <td><strong>{{ tx.type }}</strong></td>
                      <td><span class="curr-cell">{{ tx.currencyFlag }} {{ tx.displayCurrency }}</span></td>
                      <td class="amount-cell">{{ tx.displayAmount }}</td>
                      <td><wizz-badge [tone]="tx.status === 'Completed' ? 'verified' : 'pending'">{{ tx.status }}</wizz-badge></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }
      }
    </wizz-app-shell>

    <wizz-modal [open]="showAddFundsModal()" title="Add Funds to Wallet" subtitle="Instantly top up your available WIZZ USD balance from your verified primary bank." tone="info" (closed)="showAddFundsModal.set(false)">
      <wizz-input label="Top-up Amount (USD)" type="number" [(value)]="topUpAmount" />
      <wizz-button [fullWidth]="true" (clicked)="confirmTopUp()">Add Funds Now</wizz-button>
    </wizz-modal>
  `,
  styles: [
    `
      .state-switcher-bar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 10px 14px; margin-bottom: 20px; border-radius: 12px; background: #f7f6ff; border: 1px solid var(--wizz-primary-border); }
      .switcher-title { font-size: 0.76rem; font-weight: 700; color: var(--wizz-primary); }
      .switcher-pills { display: flex; flex-wrap: wrap; gap: 6px; }
      .sw-pill { padding: 5px 11px; border-radius: 999px; border: 1px solid var(--wizz-border); background: #ffffff; font-size: 0.72rem; font-weight: 600; color: var(--wizz-text-secondary); cursor: pointer; }
      .sw-pill--active { background: var(--wizz-primary); border-color: var(--wizz-primary); color: #ffffff; }
      .dash-section { display: flex; flex-direction: column; gap: 20px; }
      .page-title { margin: 0; font-size: 1.45rem; font-weight: 800; }
      .section-heading { margin: 4px 0 0; font-size: 0.96rem; font-weight: 700; }
      .m-0 { margin: 0; }
      .verification-hero-banner { background: linear-gradient(125deg, #111218 0%, #262938 100%); color: #ffffff; border-radius: 18px; padding: 24px 26px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 18px; }
      .verif-left { display: flex; align-items: flex-start; gap: 14px; max-width: 540px; }
      .verif-icon { width: 42px; height: 42px; border-radius: 12px; background: rgba(121, 101, 240, 0.25); color: #c4b5fd; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .verif-left h2 { margin: 0 0 6px; font-size: 1.12rem; }
      .verif-left p { margin: 0; font-size: 0.8rem; line-height: 1.55; color: rgba(255, 255, 255, 0.76); }
      .verif-id-card { background: #ffffff; color: var(--wizz-text); border-radius: 14px; padding: 14px 18px; display: flex; align-items: center; gap: 12px; }
      .verif-avatar { width: 38px; height: 38px; border-radius: 50%; background: #fdecec; color: var(--wizz-danger); font-weight: 800; display: inline-flex; align-items: center; justify-content: center; }
      .verif-id-card strong { display: block; font-size: 0.86rem; }
      .verif-id-card small { font-size: 0.72rem; color: var(--wizz-amber-dark); font-weight: 600; }
      .promo-three-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-top: 20px; }
      .info-card { border: 1px solid var(--wizz-border); border-radius: 16px; padding: 18px; background: #ffffff; display: flex; flex-direction: column; gap: 8px; }
      .info-emoji { font-size: 1.6rem; }
      .info-card h4 { margin: 0; font-size: 0.95rem; font-weight: 700; }
      .info-card p { margin: 0; font-size: 0.78rem; line-height: 1.5; color: var(--wizz-text-secondary); flex: 1; }
      .welcome-cards-grid, .promo-three-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
      .welcome-card, .info-card { border: 1px solid var(--wizz-border); border-radius: 16px; padding: 18px; background: #ffffff; display: flex; flex-direction: column; gap: 8px; }
      .welcome-visual { position: relative; height: 92px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 4px; }
      .welcome-visual--dark { background: linear-gradient(135deg, #1d1f2b, #32364a); }
      .welcome-visual--purple { background: linear-gradient(135deg, #ede9fe, #ddd6fe); }
      .welcome-visual--soft { background: linear-gradient(135deg, #f3f4f6, #e5e7eb); }
      .completed-tag { position: absolute; top: 8px; right: 8px; background: var(--wizz-green); color: #ffffff; font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
      .welcome-card h3, .info-card h4 { margin: 0; font-size: 0.95rem; font-weight: 700; }
      .welcome-card p, .info-card p { margin: 0; font-size: 0.78rem; line-height: 1.5; color: var(--wizz-text-secondary); flex: 1; }
      .card-cta { display: inline-flex; align-items: center; gap: 5px; font-size: 0.78rem; font-weight: 700; color: var(--wizz-primary); margin-top: 4px; }
      .total-balance-banner { padding: 24px 26px; border-radius: 18px; border: 1px solid var(--wizz-border); background: linear-gradient(125deg, #ffffff 45%, #f5f6fb 100%); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 18px; }
      .bal-caption { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; color: var(--wizz-text-muted); }
      .bal-amount-row { display: flex; align-items: baseline; flex-wrap: wrap; gap: 12px; margin-top: 6px; }
      .big-balance { font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; letter-spacing: -0.02em; }
      .growth-tag { font-size: 0.78rem; font-weight: 700; color: var(--wizz-green-dark); }
      .growth-tag small { color: var(--wizz-text-muted); font-weight: 500; }
      .bal-actions { display: flex; flex-wrap: wrap; gap: 10px; }
      .currency-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(195px, 1fr)); gap: 14px; }
      .curr-card { padding: 18px; border-radius: 16px; border: 1px solid var(--wizz-border); background: #ffffff; display: flex; flex-direction: column; gap: 5px; }
      .curr-flag { font-size: 1.45rem; }
      .curr-name { font-size: 0.76rem; color: var(--wizz-text-muted); }
      .curr-val { font-size: 1.15rem; font-weight: 800; }
      .curr-card small { font-size: 0.7rem; color: var(--wizz-text-muted); }
      .recent-head { display: flex; align-items: center; justify-content: space-between; }
      .view-all-link { font-size: 0.8rem; font-weight: 600; color: var(--wizz-text); }
      .table-box { border: 1px solid var(--wizz-border); border-radius: 16px; overflow-x: auto; background: #ffffff; }
      .tx-table { width: 100%; border-collapse: collapse; min-width: 580px; }
      .tx-table th { text-align: left; padding: 13px 18px; background: #f8f9fc; font-size: 0.74rem; color: var(--wizz-text-muted); border-bottom: 1px solid var(--wizz-border); }
      .tx-table td { padding: 15px 18px; font-size: 0.83rem; border-bottom: 1px solid #f1f2f7; cursor: pointer; }
      .tx-table tbody tr:hover { background: #fafbfe; }
      .curr-cell { display: inline-flex; align-items: center; gap: 6px; }
      .amount-cell { font-weight: 700; }
    `,
  ],
})
export class DashboardPageComponent {
  protected readonly store = inject(WizzPlatformStore);
  protected readonly toast = inject(ToastService);
  protected readonly formatMoneyFn = formatMoney;
  private readonly router = inject(Router);

  readonly balanceTab = signal('available');
  readonly showAddFundsModal = signal(false);
  readonly topUpAmount = signal('100');

  readonly overviewTabs = computed<readonly TabOption[]>(() => [
    { id: 'available', label: 'Available Balances' },
    { id: 'transit', label: 'In Transit', badge: this.store.inTransitTransactions().length },
  ]);

  readonly visibleTransactions = computed(() => {
    if (this.balanceTab() === 'transit') return this.store.inTransitTransactions();
    return this.store.transactions();
  });

  setMode(mode: DashboardExperienceMode): void { this.store.dashboardMode.set(mode); }
  confirmTopUp(): void {
    const val = Number(this.topUpAmount()) || 0;
    if (val > 0) {
      this.store.availableWalletUsd.update(curr => Number((curr + val).toFixed(2)));
      this.toast.show(`Added $${val.toFixed(2)} to your available balance`, 'success');
    }
    this.showAddFundsModal.set(false);
  }
  formatUsd(val: number): string { return formatMoney(val, 'USD'); }
  go(path: string): void { this.router.navigate([path]); }
}

@Component({
  selector: 'app-payments-history-page',
  standalone: true,
  imports: [AppShellComponent, UiButtonComponent, UiBadgeComponent, UiInputComponent, UiDrawerComponent, UiEmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wizz-app-shell>
      <div class="page-head">
        <div><h1>Payments</h1><p class="sub">Track all outbound remittances and incoming cross-border settlements.</p></div>
        <wizz-button leadingIcon="send" (clicked)="go('/send-money')">Make a Payment</wizz-button>
      </div>
      <div class="filter-bar"><wizz-input placeholder="Search by beneficiary, currency, or reference ID..." leadingIcon="search" [(value)]="query" /></div>
      @if (filtered().length === 0) {
        <wizz-empty-state icon="receipt" title="No Matching Payments" description="Try clearing your search filter or initiate a new cross-border transfer." >
          <wizz-button size="sm" (clicked)="query.set('')">Clear Search</wizz-button>
        </wizz-empty-state>
      } @else {
        <div class="table-wrap">
          <table class="tx-table">
            <thead><tr><th>Reference</th><th>Date</th><th>Description</th><th>Beneficiary</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              @for (tx of filtered(); track tx.id) {
                <tr (click)="selectedTx.set(tx)">
                  <td><code>{{ tx.id }}</code></td>
                  <td>{{ tx.date }}</td>
                  <td><strong>{{ tx.type }}</strong></td>
                  <td>{{ tx.beneficiaryName }}</td>
                  <td>{{ tx.currencyFlag }} {{ tx.displayAmount }}</td>
                  <td><wizz-badge [tone]="tx.status === 'Completed' ? 'verified' : 'pending'">{{ tx.status }}</wizz-badge></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </wizz-app-shell>
    <wizz-drawer [open]="!!selectedTx()" title="Transaction Receipt" [subtitle]="selectedTx()?.id || ''" (closed)="selectedTx.set(null)">
      @if (selectedTx(); as tx) {
        <div class="receipt-stack">
          <div class="receipt-amount">
            <span>Amount Delivered</span><strong>{{ tx.currencyFlag }} {{ tx.displayAmount }}</strong><wizz-badge [tone]="tx.status === 'Completed' ? 'verified' : 'pending'">{{ tx.status }}</wizz-badge>
          </div>
          <div class="kv-row"><span>Date</span><strong>{{ tx.date }}</strong></div>
          <div class="kv-row"><span>Beneficiary</span><strong>{{ tx.beneficiaryName }}</strong></div>
          <div class="kv-row"><span>Offered FX Rate</span><strong>{{ tx.fxRateText }}</strong></div>
          <div class="kv-row"><span>Included Fees</span><strong>&#36;{{ tx.feeUsd.toFixed(2) }}</strong></div>
          <div class="kv-row"><span>Purpose</span><strong>{{ tx.purpose }}</strong></div>
        </div>
      }
      <div drawer-footer><wizz-button [fullWidth]="true" leadingIcon="download" (clicked)="downloadReceipt()">Download PDF Receipt</wizz-button></div>
    </wizz-drawer>
  `,
  styles: [
    `
      .page-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
      .page-head h1 { margin: 0; font-size: 1.45rem; font-weight: 800; }
      .sub { margin: 4px 0 0; font-size: 0.82rem; color: var(--wizz-text-secondary); }
      .filter-bar { max-width: 420px; margin-bottom: 18px; }
      .table-wrap { border: 1px solid var(--wizz-border); border-radius: 16px; overflow-x: auto; }
      .tx-table { width: 100%; border-collapse: collapse; min-width: 620px; }
      .tx-table th { text-align: left; padding: 13px 16px; background: #f8f9fc; font-size: 0.74rem; color: var(--wizz-text-muted); border-bottom: 1px solid var(--wizz-border); }
      .tx-table td { padding: 14px 16px; font-size: 0.83rem; border-bottom: 1px solid #f1f2f7; cursor: pointer; }
      .tx-table tbody tr:hover { background: #fafbfe; }
      .receipt-stack { display: flex; flex-direction: column; gap: 14px; }
      .receipt-amount { padding: 20px; border-radius: 14px; background: var(--wizz-surface-muted); display: flex; flex-direction: column; align-items: center; gap: 6px; }
      .receipt-amount strong { font-size: 1.5rem; }
      .kv-row { display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--wizz-border); font-size: 0.84rem; }
      .kv-row span { color: var(--wizz-text-muted); }
    `,
  ],
})
export class PaymentsHistoryPageComponent {
  protected readonly store = inject(WizzPlatformStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly query = signal('');
  readonly selectedTx = signal<RemittanceTransaction | null>(null);
  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.store.transactions();
    return this.store.transactions().filter(t => t.id.toLowerCase().includes(q) || t.beneficiaryName.toLowerCase().includes(q) || t.type.toLowerCase().includes(q) || t.displayCurrency.toLowerCase().includes(q));
  });
  downloadReceipt(): void { this.toast.show('Transaction receipt downloaded', 'success'); this.selectedTx.set(null); }
  go(path: string): void { this.router.navigate([path]); }
}

@Component({
  selector: 'app-receiving-accounts-page',
  standalone: true,
  imports: [AppShellComponent, UiBadgeComponent, UiButtonComponent, WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wizz-app-shell>
      <div class="page-head">
        <div><h1>Receiving Accounts</h1><p class="sub">Virtual local account numbers so international clients can pay you like a local with zero conversion chaos.</p></div>
      </div>
      <div class="va-grid">
        @for (va of store.virtualAccounts(); track va.id) {
          <article class="va-card">
            <div class="va-top">
              <div class="va-curr"><span class="flag">{{ va.flag }}</span><div><strong>{{ va.currencyName }}</strong><span>{{ va.bankName }}</span></div></div>
              <wizz-badge tone="verified">{{ va.status }}</wizz-badge>
            </div>
            <div class="va-details">
              <div class="va-row"><span>Account Holder</span><strong>{{ va.accountHolder }}</strong></div>
              <div class="va-row"><span>Account / IBAN</span><div class="copy-inline"><strong>{{ va.accountNumber }}</strong><button type="button" class="copy-btn" (click)="copy(va.accountNumber)"><wizz-icon name="copy" [size]="14" /></button></div></div>
              <div class="va-row"><span>{{ va.routingLabel }}</span><div class="copy-inline"><strong>{{ va.routingValue }}</strong><button type="button" class="copy-btn" (click)="copy(va.routingValue)"><wizz-icon name="copy" [size]="14" /></button></div></div>
            </div>
          </article>
        }
      </div>
    </wizz-app-shell>
  `,
  styles: [
    `
      .page-head { margin-bottom: 24px; }
      .page-head h1 { margin: 0; font-size: 1.45rem; font-weight: 800; }
      .sub { margin: 4px 0 0; font-size: 0.84rem; color: var(--wizz-text-secondary); }
      .va-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 18px; }
      .va-card { border: 1px solid var(--wizz-border); border-radius: 18px; padding: 20px; background: #ffffff; display: flex; flex-direction: column; gap: 16px; }
      .va-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
      .va-curr { display: flex; gap: 10px; }
      .flag { font-size: 1.6rem; }
      .va-curr strong { display: block; font-size: 0.92rem; }
      .va-curr span { font-size: 0.75rem; color: var(--wizz-text-muted); }
      .va-details { display: flex; flex-direction: column; gap: 10px; padding-top: 12px; border-top: 1px solid var(--wizz-border); }
      .va-row { display: flex; justify-content: space-between; font-size: 0.82rem; }
      .va-row small { color: var(--wizz-text-muted); }
      .copy-inline { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }
      .copy-inline strong { overflow-wrap: anywhere; }
      .copy-btn { flex: 0 0 auto; background: var(--wizz-surface-muted); border: 1px solid var(--wizz-border); border-radius: 6px; padding: 4px; cursor: pointer; display: inline-flex; }
      @media (max-width: 480px) {
        .va-row { align-items: flex-start; gap: 8px; }
        .va-row > span { flex: 0 0 38%; }
        .va-row > .copy-inline { flex: 1; justify-content: flex-end; }
      }
    `,
  ],
})
export class ReceivingAccountsPageComponent {
  protected readonly store = inject(WizzPlatformStore);
  private readonly toast = inject(ToastService);
  copy(val: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(val).catch(() => undefined);
    this.toast.show(`Copied ${val} to clipboard`, 'success');
  }
}
