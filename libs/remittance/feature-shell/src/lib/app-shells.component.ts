import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '@wizz/design-tokens';
import { WizzPlatformStore } from '@wizz/remittance-data-access';
import {
  BrandLogoComponent,
  ToastService,
  UiButtonComponent,
  UiModalComponent,
  WizzIconComponent,
  WizzIconName,
} from '@wizz/ui';
import { formatMoney } from '@wizz/utils';

export interface NavItem {
  readonly label: string;
  readonly mobileLabel: string;
  readonly route: string;
  readonly icon: WizzIconName;
}

const DEFAULT_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Overview', mobileLabel: 'Overview', route: '/dashboard', icon: 'grid' },
  { label: 'Payments', mobileLabel: 'Payments', route: '/payments', icon: 'banknote' },
  {
    label: 'Payments Methods',
    mobileLabel: 'Methods',
    route: '/payment-methods',
    icon: 'credit-card',
  },
  {
    label: 'Receiving Accounts',
    mobileLabel: 'Accounts',
    route: '/receiving-accounts',
    icon: 'check',
  },
  {
    label: 'Beneficiaries',
    mobileLabel: 'Beneficiaries',
    route: '/beneficiaries',
    icon: 'users',
  },
];

@Component({
  selector: 'wizz-top-navbar',
  standalone: true,
  imports: [RouterLink, BrandLogoComponent, WizzIconComponent, UiModalComponent, UiButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="top-navbar">
      <div class="nav-left">
        <a routerLink="/dashboard" class="logo-link">
          <wizz-brand-logo [light]="true" size="sm" />
        </a>
      </div>

      <div class="nav-right">
        <button type="button" class="screens-pill" (click)="showNavigator.set(true)">
          <wizz-icon name="sparkles" [size]="14" />
          <span class="hide-xs">All 27 Flows</span>
        </button>

        <button type="button" class="help-pill" (click)="showHelpModal.set(true)">
          <wizz-icon name="headphones" [size]="14" />
          <span class="hide-xs">Get Help</span>
        </button>

        <button
          type="button"
          class="icon-circle-btn"
          (click)="showNotifications.update((v) => !v)"
          aria-label="Notifications"
        >
          <wizz-icon name="bell" [size]="17" />
          <span class="notif-dot"></span>
        </button>

        <div class="profile-dropdown-wrap">
          <button type="button" class="user-pill" (click)="showUserMenu.update((v) => !v)">
            <span class="avatar-dot">{{ store.user().firstName[0] || 'A' }}</span>
            <span class="user-text hide-sm">{{ store.user().email }}</span>
            <wizz-icon name="chevron-down" [size]="14" />
          </button>

          @if (showUserMenu()) {
            <div class="dropdown-menu" (mouseleave)="showUserMenu.set(false)">
              <div class="dropdown-user-head">
                <strong>{{ store.fullName() }}</strong>
                <span>{{ store.user().email }}</span>
              </div>
              <a routerLink="/profile" class="dropdown-item" (click)="showUserMenu.set(false)">
                <wizz-icon name="user" [size]="15" /> My Profile &amp; Settings
              </a>
              <a routerLink="/onboarding" class="dropdown-item" (click)="showUserMenu.set(false)">
                <wizz-icon name="shield-check" [size]="15" /> Onboarding &amp; KYC Setup
              </a>
              <a routerLink="/send-money" class="dropdown-item" (click)="showUserMenu.set(false)">
                <wizz-icon name="send" [size]="15" /> Make a Payment
              </a>
              <a
                routerLink="/legal"
                [queryParams]="{ view: 'terms' }"
                [queryParams]="{ updated: '1' }"
                class="dropdown-item"
                (click)="showUserMenu.set(false)"
              >
                <wizz-icon name="file-text" [size]="15" /> Updated Terms &amp; Conditions
              </a>
              <button type="button" class="dropdown-item" (click)="resetDemo()">
                <wizz-icon name="refresh" [size]="15" /> Reset Demo Data
              </button>
              <hr class="menu-sep" />
              <button type="button" class="dropdown-item dropdown-item--danger" (click)="logout()">
                <wizz-icon name="log-out" [size]="15" /> Logout
              </button>
            </div>
          }

          @if (showNotifications()) {
            <div class="dropdown-menu notif-menu" (mouseleave)="showNotifications.set(false)">
              <div class="dropdown-user-head">
                <strong>Notifications</strong>
                <span>Latest account updates</span>
              </div>
              <div class="notif-row">
                <span class="notif-badge notif-badge--green"></span>
                <div>
                  <p>Payment of $2,000 received in FIBI Bank</p>
                  <small>2 hours ago</small>
                </div>
              </div>
              <div class="notif-row">
                <span class="notif-badge notif-badge--amber"></span>
                <div>
                  <p>Citibank • 1021 awaits small-charge verification</p>
                  <small>Today</small>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </header>

    <!-- Get Help Modal -->
    <wizz-modal
      [open]="showHelpModal()"
      title="24/7 Paygate Priority Support"
      subtitle="Need help with KYC verification, micro-deposits, or an international remittance?"
      tone="info"
      [showSupportFooter]="true"
      (closed)="showHelpModal.set(false)"
    >
      <div class="help-cards">
        <div class="help-card">
          <strong>Email Support</strong>
          <span>{{ theme.brand().supportEmail }}</span>
        </div>
        <div class="help-card">
          <strong>Toll-Free Desk</strong>
          <span>{{ theme.brand().supportPhone }}</span>
        </div>
      </div>
      <wizz-button [fullWidth]="true" (clicked)="showHelpModal.set(false)">Got It</wizz-button>
    </wizz-modal>

    <!-- All 27 Screens Quick Flow Navigator Modal -->
    <wizz-modal
      [open]="showNavigator()"
      title="Interactive Screen &amp; Flow Directory"
      subtitle="Jump directly to any of the 27 Figma screens &amp; flows across all 7 domains."
      [maxWidth]="640"
      (closed)="showNavigator.set(false)"
    >
      <div class="flow-grid">
        @for (item of flowLinks; track item.code) {
          <button type="button" class="flow-chip" (click)="goToFlow(item.route, item.query)">
            <span class="flow-code">{{ item.code }}</span>
            <span class="flow-name">{{ item.label }}</span>
          </button>
        }
      </div>
    </wizz-modal>
  `,
  styles: [
    `
      .top-navbar {
        height: 58px;
        background: radial-gradient(circle at 28% -40%, #2a2c38 0%, var(--wizz-navbar-bg) 55%);
        color: #ffffff;
        padding: 0 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        z-index: 500;
      }
      .logo-link {
        text-decoration: none;
        display: inline-flex;
      }
      .nav-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .screens-pill {
        height: 32px;
        padding: 0 12px;
        border-radius: 999px;
        border: 1px solid rgba(121, 101, 240, 0.55);
        background: rgba(121, 101, 240, 0.18);
        color: #e2ddff;
        font-size: 0.75rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }
      .screens-pill:hover {
        background: rgba(121, 101, 240, 0.32);
      }
      .help-pill {
        height: 32px;
        padding: 0 14px;
        border-radius: 999px;
        border: none;
        background: #ffffff;
        color: #14151a;
        font-size: 0.76rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }
      .icon-circle-btn {
        position: relative;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.06);
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .notif-dot {
        position: absolute;
        top: 7px;
        right: 8px;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #ff4d4f;
      }
      .profile-dropdown-wrap {
        position: relative;
      }
      .user-pill {
        height: 34px;
        padding: 0 12px 0 6px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 0.78rem;
      }
      .avatar-dot {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--wizz-primary);
        color: #ffffff;
        font-size: 0.72rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .dropdown-menu {
        position: absolute;
        right: 0;
        top: calc(100% + 8px);
        width: 250px;
        background: #ffffff;
        color: var(--wizz-text);
        border-radius: 14px;
        border: 1px solid var(--wizz-border);
        box-shadow: var(--wizz-shadow-md);
        padding: 8px;
        z-index: 600;
      }
      .notif-menu {
        width: 290px;
      }
      .dropdown-user-head {
        padding: 8px 10px 10px;
        border-bottom: 1px solid var(--wizz-border);
        margin-bottom: 6px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .dropdown-user-head strong {
        font-size: 0.85rem;
      }
      .dropdown-user-head span {
        font-size: 0.74rem;
        color: var(--wizz-text-muted);
      }
      .dropdown-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 9px 10px;
        border-radius: 8px;
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--wizz-text);
        background: none;
        border: none;
        cursor: pointer;
        text-decoration: none;
        text-align: left;
      }
      .dropdown-item:hover {
        background: var(--wizz-surface-muted);
      }
      .dropdown-item--danger {
        color: var(--wizz-danger);
      }
      .menu-sep {
        border: none;
        border-top: 1px solid var(--wizz-border);
        margin: 6px 0;
      }
      .notif-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 9px 10px;
        border-radius: 8px;
      }
      .notif-row p {
        margin: 0 0 2px;
        font-size: 0.78rem;
        font-weight: 500;
      }
      .notif-row small {
        font-size: 0.7rem;
        color: var(--wizz-text-muted);
      }
      .notif-badge {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-top: 5px;
        flex-shrink: 0;
      }
      .notif-badge--green {
        background: var(--wizz-green);
      }
      .notif-badge--amber {
        background: var(--wizz-amber);
      }
      .help-cards {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .help-card {
        padding: 12px;
        border-radius: 12px;
        background: var(--wizz-surface-muted);
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 0.78rem;
      }
      .flow-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr));
        gap: 8px;
        max-height: 55vh;
        overflow-y: auto;
        padding-right: 4px;
      }
      .flow-chip {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 11px;
        border-radius: 10px;
        border: 1px solid var(--wizz-border);
        background: var(--wizz-surface-muted);
        cursor: pointer;
        text-align: left;
        transition: all 0.15s ease;
      }
      .flow-chip:hover {
        border-color: var(--wizz-primary);
        background: var(--wizz-primary-soft);
      }
      .flow-code {
        background: var(--wizz-primary);
        color: #ffffff;
        font-size: 0.68rem;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 5px;
        flex-shrink: 0;
      }
      .flow-name {
        font-size: 0.76rem;
        font-weight: 600;
        color: var(--wizz-text);
      }
      @media (max-width: 767px) {
        .top-navbar {
          padding: 0 14px;
        }
        .hide-sm {
          display: none;
        }
      }
      @media (max-width: 480px) {
        .hide-xs {
          display: none;
        }
        .help-cards {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TopNavbarComponent {
  protected readonly store = inject(WizzPlatformStore);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly showHelpModal = signal(false);
  readonly showUserMenu = signal(false);
  readonly showNotifications = signal(false);
  readonly showNavigator = signal(false);

  protected readonly flowLinks: readonly {
    code: string;
    label: string;
    route: string;
    query?: Record<string, string>;
  }[] = [
    { code: '01', label: 'Base Landing Screen', route: '/' },
    { code: '02', label: 'Signup Individual & Profile Type', route: '/auth/signup' },
    {
      code: '03',
      label: 'Signup Uniqueness Checks',
      route: '/auth/signup',
      query: { demo: 'uniqueness' },
    },
    {
      code: '04',
      label: 'Verify Email & Phone OTP',
      route: '/auth/signup',
      query: { demo: 'verify' },
    },
    { code: '05', label: 'Login (Email, Password & MFA)', route: '/auth/login' },
    {
      code: '06',
      label: 'Post-Login Update Profile Wizard',
      route: '/onboarding/personal-details',
    },
    {
      code: '07',
      label: 'Social Login (Google & Apple OAuth)',
      route: '/auth/login',
      query: { demo: 'social' },
    },
    {
      code: '08',
      label: 'Complete Profile After Social Login',
      route: '/onboarding/personal-details',
      query: { social: '1' },
    },
    { code: '09', label: 'Forgot Password Request', route: '/auth/forgot-password' },
    { code: '10', label: 'Set New Password / Link Expired', route: '/auth/reset-password' },
    { code: '11', label: 'Upload Identity Document (KYC)', route: '/onboarding/kyc' },
    {
      code: '12',
      label: 'View & Remove Identity Document',
      route: '/onboarding/kyc',
      query: { view: 'summary' },
    },
    { code: '13', label: 'Complete Liveness Selfie Check', route: '/onboarding/liveness' },
    {
      code: '14',
      label: 'Add Beneficiary Details & Address',
      route: '/beneficiaries',
      query: { action: 'add' },
    },
    {
      code: '15',
      label: 'Add Beneficiary Bank & Confirm',
      route: '/beneficiaries',
      query: { action: 'add-bank' },
    },
    { code: '16', label: 'View & Filter Beneficiary List', route: '/beneficiaries' },
    {
      code: '17',
      label: 'Beneficiary Details & Remove',
      route: '/beneficiaries',
      query: { action: 'details' },
    },
    {
      code: '18',
      label: 'Terms & Conditions + My Profile',
      route: '/profile',
    },
    {
      code: '19',
      label: 'Add Payment Method - Bank Account',
      route: '/payment-methods',
      query: { tab: 'banks', action: 'add' },
    },
    {
      code: '20',
      label: 'Verify Bank - Micro Deposit',
      route: '/payment-methods',
      query: { tab: 'banks', action: 'verify' },
    },
    {
      code: '21',
      label: 'Add Payment Method - Card',
      route: '/payment-methods',
      query: { tab: 'cards', action: 'add' },
    },
    {
      code: '22',
      label: 'Verify Card - Small Charge',
      route: '/payment-methods',
      query: { tab: 'cards', action: 'verify' },
    },
    {
      code: '23',
      label: 'Remove Payment Method',
      route: '/payment-methods',
      query: { tab: 'cards', action: 'remove' },
    },
    {
      code: '24',
      label: 'Send Money - Initiate Remittance',
      route: '/send-money',
      query: { step: '1' },
    },
    {
      code: '26',
      label: 'Send Money - Select Beneficiary',
      route: '/send-money',
      query: { step: '2' },
    },
    {
      code: '27',
      label: 'Send Money - Select Payment Method',
      route: '/send-money',
      query: { step: '3' },
    },
    {
      code: '25',
      label: 'Compliance, Review & Confirmation',
      route: '/send-money',
      query: { step: '5' },
    },
  ];

  goToFlow(route: string, query?: Record<string, string>): void {
    this.showNavigator.set(false);
    this.router.navigate([route], { queryParams: query ?? {} });
  }

  resetDemo(): void {
    this.store.resetDemoState();
    this.showUserMenu.set(false);
    this.toast.show('Demo state restored to default data', 'success');
  }

  logout(): void {
    this.store.logout();
    this.showUserMenu.set(false);
    this.router.navigate(['/auth/login']);
  }
}

@Component({
  selector: 'wizz-app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TopNavbarComponent, WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell-root">
      <wizz-top-navbar />

      <!-- Mobile Top Balance Strip (< 768px, matching Figma mobile header!) -->
      <div class="mobile-balance-strip">
        <div class="strip-half strip-half--transit">
          <wizz-icon name="arrow-left-right" [size]="13" />
          <span
            >IN TRANSIT <strong>{{ formatUsd(store.inTransitUsd()) }}</strong></span
          >
        </div>
        <div class="strip-half strip-half--avail">
          <wizz-icon name="check" [size]="13" />
          <span
            >AVAILABLE <strong>{{ formatUsd(store.availableWalletUsd()) }}</strong></span
          >
        </div>
      </div>

      <div class="shell-body">
        <!-- Desktop Sidebar -->
        <aside class="sidebar">
          <nav class="sidebar-nav">
            @for (item of navItems(); track item.route) {
              <a [routerLink]="item.route" routerLinkActive="nav-link--active" class="nav-link">
                <wizz-icon [name]="item.icon" [size]="17" />
                <span>{{ item.label }}</span>
              </a>
            }
          </nav>

          <div class="sidebar-bottom">
            <div class="balance-pills">
              <div class="bal-pill bal-pill--transit">
                <wizz-icon name="arrow-left-right" [size]="13" />
                <span
                  >IN TRANSIT <strong>{{ formatUsd(store.inTransitUsd()) }}</strong></span
                >
              </div>
              <div class="bal-pill bal-pill--avail">
                <wizz-icon name="check" [size]="13" />
                <span
                  >AVAILABLE <strong>{{ formatUsd(store.availableWalletUsd()) }}</strong></span
                >
              </div>
            </div>

            <div class="sidebar-legal">
              <a routerLink="/legal" [queryParams]="{ view: 'terms' }">Terms &amp; Conditions</a>
              <a routerLink="/legal" [queryParams]="{ view: 'privacy' }">Privacy Policies</a>
              <span class="ver">{{ theme.brand().version }}</span>
            </div>
          </div>
        </aside>

        <!-- Main Workspace -->
        <main class="workspace">
          <ng-content />
        </main>
      </div>

      <!-- Mobile Bottom Navigation (< 768px) -->
      <nav class="mobile-bottom-nav" aria-label="Primary Mobile Navigation">
        @for (item of navItems(); track item.route) {
          <a [routerLink]="item.route" routerLinkActive="mob-tab--active" class="mob-tab">
            <wizz-icon [name]="item.icon" [size]="19" />
            <span>{{ item.mobileLabel }}</span>
          </a>
        }
      </nav>
    </div>
  `,
  styles: [
    `
      .shell-root {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: #ffffff;
      }
      .mobile-balance-strip {
        display: none;
        grid-template-columns: 1fr 1fr;
        font-size: 0.72rem;
        font-weight: 600;
      }
      .strip-half {
        padding: 8px 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }
      .strip-half--transit {
        background: #f4f2ff;
        color: #5b48d9;
      }
      .strip-half--avail {
        background: #eaf8ee;
        color: #268644;
      }
      .shell-body {
        flex: 1;
        display: grid;
        grid-template-columns: 244px minmax(0, 1fr);
      }
      .sidebar {
        background: #f9fafc;
        border-right: 1px solid var(--wizz-border);
        padding: 20px 14px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: calc(100vh - 58px);
      }
      .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .nav-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 10px;
        font-size: 0.84rem;
        font-weight: 500;
        color: var(--wizz-text-secondary);
        text-decoration: none;
        transition: all 0.15s ease;
      }
      .nav-link:hover {
        background: #eff1f7;
        color: var(--wizz-text);
      }
      .nav-link--active {
        background: #ffffff;
        color: var(--wizz-text);
        font-weight: 700;
        box-shadow: var(--wizz-shadow-xs);
      }
      .sidebar-bottom {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding-top: 24px;
      }
      .balance-pills {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .bal-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 0.7rem;
        font-weight: 600;
      }
      .bal-pill--transit {
        background: #f2f0fe;
        color: #5d4ad8;
      }
      .bal-pill--avail {
        background: #eaf8ee;
        color: #278846;
      }
      .sidebar-legal {
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 0 6px;
        font-size: 0.72rem;
        color: var(--wizz-text-muted);
      }
      .sidebar-legal a {
        color: var(--wizz-text-muted);
      }
      .sidebar-legal a:hover {
        color: var(--wizz-primary);
      }
      .workspace {
        padding: 28px 34px 48px;
        min-width: 0;
      }
      .mobile-bottom-nav {
        display: none;
      }

      @media (max-width: 960px) {
        .workspace {
          padding: 22px 20px 40px;
        }
        .shell-body {
          grid-template-columns: 210px minmax(0, 1fr);
        }
      }

      @media (max-width: 767px) {
        .mobile-balance-strip {
          display: grid;
        }
        .sidebar {
          display: none;
        }
        .shell-body {
          grid-template-columns: 1fr;
        }
        .workspace {
          padding: 18px 16px 88px;
        }
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 480;
          height: 64px;
          background: #ffffff;
          border-top: 1px solid var(--wizz-border);
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          padding: 4px 6px;
        }
        .mob-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          font-size: 0.66rem;
          font-weight: 600;
          color: var(--wizz-text-muted);
          text-decoration: none;
        }
        .mob-tab--active {
          color: var(--wizz-primary);
        }
      }
    `,
  ],
})
export class AppShellComponent {
  protected readonly store = inject(WizzPlatformStore);
  protected readonly theme = inject(ThemeService);

  readonly navItems = input<readonly NavItem[]>(DEFAULT_NAV_ITEMS);

  formatUsd(amount: number): string {
    return formatMoney(amount, 'USD');
  }
}

@Component({
  selector: 'wizz-focused-flow-shell',
  standalone: true,
  imports: [RouterLink, TopNavbarComponent, WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="focused-root">
      <wizz-top-navbar />

      @if (title()) {
        <div class="sub-bar">
          <div class="sub-left">
            <button type="button" class="back-title-btn" (click)="backClicked.emit()">
              <wizz-icon name="chevron-left" [size]="20" />
              <span>{{ title() }}</span>
            </button>
            @if (progress() !== null) {
              <div class="progress-track" aria-label="Step progress">
                <div class="progress-fill" [style.width.%]="progress()"></div>
              </div>
            }
          </div>

          @if (showBalancePills()) {
            <div class="sub-pills">
              <span class="mini-pill mini-pill--transit">
                <wizz-icon name="arrow-left-right" [size]="12" />
                IN TRANSIT {{ formatUsd(store.inTransitUsd()) }}
              </span>
              <span class="mini-pill mini-pill--avail">
                <wizz-icon name="check" [size]="12" />
                AVAILABLE {{ formatUsd(store.availableWalletUsd()) }}
              </span>
            </div>
          }
        </div>
      }

      <main class="focused-main" [style.maxWidth.px]="maxWidth()">
        <ng-content />
      </main>

      <footer class="focused-footer">
        <a routerLink="/legal" [queryParams]="{ view: 'terms' }">Terms &amp; Conditions</a>
        <span>·</span>
        <a routerLink="/legal" [queryParams]="{ view: 'privacy' }">Privacy Policies</a>
        <span>·</span>
        <span>{{ theme.brand().version }}</span>
      </footer>
    </div>
  `,
  styles: [
    `
      .focused-root {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: #ffffff;
      }
      .sub-bar {
        max-width: 1120px;
        width: 100%;
        margin: 0 auto;
        padding: 20px 24px 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .sub-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .back-title-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        padding: 0;
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--wizz-text);
        cursor: pointer;
      }
      .progress-track {
        width: 96px;
        height: 5px;
        border-radius: 999px;
        background: #e6e8f0;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: var(--wizz-green);
        border-radius: 999px;
        transition: width 0.25s ease;
      }
      .sub-pills {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .mini-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        border-radius: 7px;
        font-size: 0.7rem;
        font-weight: 700;
      }
      .mini-pill--transit {
        background: #f2f0fe;
        color: #5b48d9;
      }
      .mini-pill--avail {
        background: #eaf8ee;
        color: #268644;
      }
      .focused-main {
        flex: 1;
        width: 100%;
        margin: 0 auto;
        padding: 28px 20px 36px;
      }
      .focused-footer {
        padding: 18px 20px 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-size: 0.75rem;
        color: var(--wizz-text-muted);
      }
      .focused-footer a {
        color: var(--wizz-text-muted);
      }
      @media (max-width: 640px) {
        .sub-bar {
          padding: 14px 16px 4px;
        }
        .sub-pills {
          width: 100%;
          justify-content: flex-start;
        }
        .focused-main {
          padding: 18px 16px 28px;
        }
      }
    `,
  ],
})
export class FocusedFlowShellComponent {
  protected readonly store = inject(WizzPlatformStore);
  protected readonly theme = inject(ThemeService);

  readonly title = input<string>('');
  readonly progress = input<number | null>(null);
  readonly showBalancePills = input<boolean>(false);
  readonly maxWidth = input<number>(520);

  readonly backClicked = output<void>();

  formatUsd(amount: number): string {
    return formatMoney(amount, 'USD');
  }
}
