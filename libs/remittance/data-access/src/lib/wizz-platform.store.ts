import { Injectable, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { BRAND_CONFIG } from '@wizz/design-tokens';
import { CURRENCIES, formatMoney } from '@wizz/utils';
import {
  BankPaymentMethod,
  BeneficiaryItem,
  CardPaymentMethod,
  CurrencyBalance,
  DashboardExperienceMode,
  IdentityDocumentItem,
  PaymentMethodItem,
  RemittanceTransaction,
  SocialAccountLink,
  UserAddress,
  UserProfile,
  VirtualReceivingAccount,
} from './models';

const INITIAL_USER: UserProfile = {
  profileType: 'individual',
  firstName: 'Ajay',
  middleName: '',
  lastName: 'Shekhawat',
  email: 'ajay@gmail.com',
  dialCode: '+1',
  phone: '(314) 232 1112',
  nationality: 'United States',
  dob: '1996-05-15',
  gender: 'Male',
  birthPlace: 'Austin, Texas',
  address: {
    type: 'Residential',
    country: 'United States',
    line1: '742 Evergreen Terrace',
    line2: 'Suite 4B',
    city: 'Austin',
    state: 'Texas',
    zipCode: '78701',
  },
  socialAccounts: [
    {
      id: 'soc-1',
      platform: 'Instagram',
      url: 'https://www.instagram.com/ajayshekhawat/',
    },
  ],
  taxCountry: 'United States',
  taxId: 'XXX-XX-8421',
  occupation: 'Principal Product Engineer',
  employerName: 'Wizz Global Technologies',
  authProvider: 'password',
  emailVerified: true,
  phoneVerified: true,
  mfaEnabled: false,
  updatedTermsAccepted: true,
};

const INITIAL_DOCS: readonly IdentityDocumentItem[] = [
  {
    id: 'doc-1',
    type: 'National ID Card',
    country: 'United States',
    documentNumber: '818726261999',
    issuedBy: 'United States Department of State',
    issuedDate: '2020-06-26',
    expirationDate: '2030-06-25',
    frontFileName: 'National ID Front.png',
    backFileName: 'National ID Back.png',
    status: 'Under Verification',
  },
];

const INITIAL_BENEFICIARIES: readonly BeneficiaryItem[] = [
  {
    id: 'ben-1',
    type: 'Individual',
    firstName: 'Jessica',
    lastName: 'Thompson',
    email: 'jess@gmail.com',
    dialCode: '+1',
    phone: '(912) 91827 7352',
    dob: '2000-12-20',
    gender: 'Female',
    nationality: 'United States',
    occupation: 'Architect',
    placeOfBirth: 'United States',
    relationship: 'Family',
    documentNumber: '818726261999',
    documentType: 'National ID Card',
    documentCountry: 'United States',
    documentIssuedDate: '2020-06-26',
    documentExpirationDate: '2030-06-25',
    address: {
      country: 'United States',
      line1: '425 Market Street',
      line2: 'Apt 14C',
      zipCode: '94105',
      city: 'San Francisco',
      state: 'California',
    },
    bank: {
      bankName: 'First National Bank of America',
      accountHolderName: 'Jessica Thompson',
      accountNumber: '814500999001',
      routingNumber: '8826340012',
      accountType: 'Savings Account',
    },
    dateAddedBucket: 'Today',
    verified: true,
  },
  {
    id: 'ben-2',
    type: 'Individual',
    firstName: 'Michael',
    lastName: 'Kane',
    email: 'michael.kane@gmail.com',
    dialCode: '+1',
    phone: '(415) 890 9022',
    dob: '1992-08-14',
    gender: 'Male',
    nationality: 'United States',
    occupation: 'Software Consultant',
    placeOfBirth: 'Chicago',
    relationship: 'Family',
    address: {
      country: 'United States',
      line1: '180 N LaSalle St',
      line2: 'Floor 9',
      zipCode: '60601',
      city: 'Chicago',
      state: 'Illinois',
    },
    bank: {
      bankName: 'Chase Bank',
      accountHolderName: 'Michael Kane',
      accountNumber: '890122349022',
      routingNumber: '021000021',
      accountType: 'Checking Account',
    },
    dateAddedBucket: 'Yesterday',
    verified: true,
    hasPendingTransfer: true,
  },
  {
    id: 'ben-3',
    type: 'Business',
    firstName: 'Michael',
    lastName: 'Kent',
    email: 'billing@kentstudio.io',
    dialCode: '+44',
    phone: '7700 900123',
    dob: '1988-03-11',
    gender: 'Male',
    nationality: 'England / United Kingdom',
    occupation: 'Design Director',
    placeOfBirth: 'London',
    relationship: 'Corporate',
    address: {
      country: 'England / United Kingdom',
      line1: '22 Bishopsgate',
      line2: 'Level 18',
      zipCode: 'EC2N 4BQ',
      city: 'London',
      state: 'Greater London',
    },
    bank: {
      bankName: 'Barclays UK',
      accountHolderName: 'Michael Kent',
      accountNumber: '749900111234',
      routingNumber: '20000000',
      accountType: 'Checking Account',
    },
    dateAddedBucket: 'This Week',
    verified: true,
  },
  {
    id: 'ben-4',
    type: 'Individual',
    firstName: 'Anna',
    lastName: 'Lee',
    email: 'anna.lee@outlook.com',
    dialCode: '+91',
    phone: '98201 55678',
    dob: '1997-11-04',
    gender: 'Female',
    nationality: 'India',
    occupation: 'Product Designer',
    placeOfBirth: 'Mumbai',
    relationship: 'Friend',
    address: {
      country: 'India',
      line1: 'Bandra Kurla Complex',
      line2: 'Tower B',
      zipCode: '400051',
      city: 'Mumbai',
      state: 'Maharashtra',
    },
    bank: {
      bankName: 'HDFC Bank',
      accountHolderName: 'Anna Lee',
      accountNumber: '501002885678',
      routingNumber: 'HDFC000012',
      accountType: 'Savings Account',
    },
    dateAddedBucket: 'This Month',
    verified: false,
  },
];

const INITIAL_PAYMENT_METHODS: readonly PaymentMethodItem[] = [
  {
    id: 'pm-bank-1',
    kind: 'bank',
    country: 'United States',
    bankName: 'Chase Bank',
    shortCode: 'CH',
    brandColor: '#117ACA',
    accountHolderName: 'Ajay Shekhawat',
    accountNumber: '814400991252',
    routingNumber: '8826340012',
    accountType: 'Savings Account',
    currency: 'USD',
    capabilities: ['Fund', 'Receive'],
    addedOn: '26 June 2025',
    verified: true,
    isPrimary: true,
  },
  {
    id: 'pm-bank-2',
    kind: 'bank',
    country: 'United States',
    bankName: 'HDFC Bank',
    shortCode: 'HD',
    brandColor: '#E31837',
    accountHolderName: 'Ajay Shekhawat',
    accountNumber: '501000992091',
    routingNumber: '026009593',
    accountType: 'Checking Account',
    currency: 'USD',
    capabilities: ['Fund', 'Receive'],
    addedOn: '14 July 2025',
    verified: true,
    isPrimary: false,
    hasPendingTx: true,
  },
  {
    id: 'pm-bank-3',
    kind: 'bank',
    country: 'United States',
    bankName: 'FIBI',
    shortCode: 'FB',
    brandColor: '#D49A1A',
    accountHolderName: 'Ajay Shekhawat',
    accountNumber: '819900221221',
    routingNumber: '8826340088',
    accountType: 'Savings Account',
    currency: 'USD',
    capabilities: ['Payout Only'],
    addedOn: '02 Aug 2025',
    verified: false,
    isPrimary: false,
  },
  {
    id: 'pm-bank-4',
    kind: 'bank',
    country: 'United States',
    bankName: 'Citi Bank',
    shortCode: 'CT',
    brandColor: '#003B70',
    accountHolderName: 'Ajay Shekhawat',
    accountNumber: '410088771002',
    routingNumber: '021000089',
    accountType: 'Checking Account',
    currency: 'USD',
    capabilities: ['Payout Only'],
    addedOn: '19 Aug 2025',
    verified: false,
    isPrimary: false,
  },
  {
    id: 'pm-card-1',
    kind: 'card',
    country: 'United States',
    issuer: 'Citibank',
    cardHolderName: 'Ajay Shekhawat',
    last4: '1021',
    expiry: '09/28',
    brand: 'mastercard',
    currency: 'USD',
    addedOn: '26 June 2025',
    verified: false,
    isPrimary: true,
    themeVariant: 'charcoal',
    billingAddress: {
      country: 'United States',
      line1: '742 Evergreen Terrace',
      line2: 'Suite 4B',
      city: 'Austin',
      state: 'Texas',
      zipCode: '78701',
    },
  },
  {
    id: 'pm-card-2',
    kind: 'card',
    country: 'United States',
    issuer: 'US Bank',
    cardHolderName: 'Ajay Shekhawat',
    last4: '2360',
    expiry: '07/28',
    brand: 'visa',
    currency: 'USD',
    addedOn: '02 July 2025',
    verified: false,
    isPrimary: false,
    themeVariant: 'navy',
    billingAddress: {
      country: 'United States',
      line1: '742 Evergreen Terrace',
      line2: '',
      city: 'Austin',
      state: 'Texas',
      zipCode: '78701',
    },
  },
  {
    id: 'pm-card-3',
    kind: 'card',
    country: 'United States',
    issuer: 'FIBI',
    cardHolderName: 'Ajay Shekhawat',
    last4: '1121',
    expiry: '12/27',
    brand: 'mastercard',
    currency: 'USD',
    addedOn: '11 July 2025',
    verified: true,
    isPrimary: false,
    themeVariant: 'royal',
    billingAddress: {
      country: 'United States',
      line1: '742 Evergreen Terrace',
      line2: '',
      city: 'Austin',
      state: 'Texas',
      zipCode: '78701',
    },
  },
  {
    id: 'pm-card-4',
    kind: 'card',
    country: 'United States',
    issuer: 'HDFC BANK',
    cardHolderName: 'Ajay Shekhawat',
    last4: '1231',
    expiry: '12/28',
    brand: 'visa',
    currency: 'USD',
    addedOn: '29 July 2025',
    verified: true,
    isPrimary: false,
    themeVariant: 'slate',
    billingAddress: {
      country: 'United States',
      line1: '742 Evergreen Terrace',
      line2: '',
      city: 'Austin',
      state: 'Texas',
      zipCode: '78701',
    },
  },
];

const INITIAL_BALANCES: readonly CurrencyBalance[] = [
  {
    currency: 'USD',
    label: 'US Dollars',
    flag: '🇺🇸',
    symbol: '$',
    amount: 151064.12,
    shareOfTotal: '65% of total balance',
  },
  {
    currency: 'AED',
    label: 'UAE Dirhams',
    flag: '🇦🇪',
    symbol: 'AED ',
    amount: 51001.12,
    shareOfTotal: '20% of total balance',
  },
  {
    currency: 'INR',
    label: 'Indian Rupees',
    flag: '🇮🇳',
    symbol: '₹',
    amount: 1021101.02,
    shareOfTotal: '10% of total balance',
  },
  {
    currency: 'GBP',
    label: 'GB Pounds',
    flag: '🇬🇧',
    symbol: '£',
    amount: 1297.09,
    shareOfTotal: '5% of total balance',
  },
];

const INITIAL_TRANSACTIONS: readonly RemittanceTransaction[] = [
  {
    id: 'R98441209',
    date: '12 June 2025',
    type: 'International Incoming Wire Transfer',
    beneficiaryName: 'Jessica Thompson',
    sendCurrency: 'USD',
    sendAmount: 56091.54,
    receiveCurrency: 'USD',
    currencyFlag: '🇺🇸',
    displayCurrency: 'USD',
    displayAmount: '$56,091.54',
    feeUsd: 3.45,
    fxRateText: '1 USD = 1.00 USD',
    purpose: 'Family',
    status: 'In Transit',
  },
  {
    id: 'R98441187',
    date: '12 June 2025',
    type: 'Inbound Remittance via SWIFT/IBAN',
    beneficiaryName: 'Anna Lee',
    sendCurrency: 'USD',
    sendAmount: 6450.0,
    receiveCurrency: 'INR',
    currencyFlag: '🇮🇳',
    displayCurrency: 'INR',
    displayAmount: '₹556,091.56',
    feeUsd: 3.45,
    fxRateText: '1 USD = 86.264 INR',
    purpose: 'Family',
    status: 'Completed',
  },
  {
    id: 'R98441102',
    date: '10 June 2025',
    type: 'International Incoming Wire Transfer',
    beneficiaryName: 'Michael Kane',
    sendCurrency: 'USD',
    sendAmount: 6091.11,
    receiveCurrency: 'USD',
    currencyFlag: '🇺🇸',
    displayCurrency: 'USD',
    displayAmount: '$6,091.11',
    feeUsd: 3.45,
    fxRateText: '1 USD = 1.00 USD',
    purpose: 'Corporate',
    status: 'In Transit',
  },
  {
    id: 'R98440998',
    date: '05 June 2025',
    type: 'Outbound Cross-Border Remittance',
    beneficiaryName: 'Michael Kent',
    sendCurrency: 'USD',
    sendAmount: 2400.0,
    receiveCurrency: 'GBP',
    currencyFlag: '🇬🇧',
    displayCurrency: 'GBP',
    displayAmount: '£1,893.60',
    feeUsd: 3.45,
    fxRateText: '1 USD = 0.789 GBP',
    purpose: 'Corporate',
    status: 'Completed',
  },
];

const INITIAL_VIRTUAL_ACCOUNTS: readonly VirtualReceivingAccount[] = [
  {
    id: 'va-usd',
    currency: 'USD',
    currencyName: 'US Dollar Local Account',
    flag: '🇺🇸',
    bankName: 'Community Federal Savings Bank (CFSB)',
    accountHolder: 'Ajay Shekhawat',
    accountNumber: '839104829102',
    routingLabel: 'ACH / Wire Routing',
    routingValue: '026073150',
    status: 'Active',
  },
  {
    id: 'va-aed',
    currency: 'AED',
    currencyName: 'UAE Dirham Local Account',
    flag: '🇦🇪',
    bankName: 'First Abu Dhabi Bank',
    accountHolder: 'Ajay Shekhawat',
    accountNumber: 'AE47035000001928374651',
    routingLabel: 'SWIFT / BIC',
    routingValue: 'NBADAEAAXXX',
    status: 'Active',
  },
  {
    id: 'va-gbp',
    currency: 'GBP',
    currencyName: 'British Pound Local Account',
    flag: '🇬🇧',
    bankName: 'ClearBank UK',
    accountHolder: 'Ajay Shekhawat',
    accountNumber: '04928173',
    routingLabel: 'UK Sort Code',
    routingValue: '04-00-75',
    status: 'Active',
  },
];

@Injectable({ providedIn: 'root' })
export class WizzPlatformStore {
  private readonly brand = inject(BRAND_CONFIG);
  private readonly storageKey = `wizz_state_${this.brand.appId}_v1`;

  // Core Auth & Onboarding Signals
  readonly isAuthenticated = signal<boolean>(true);
  readonly user = signal<UserProfile>(INITIAL_USER);
  readonly personalDetailsCompleted = signal<boolean>(true);
  readonly livenessCompleted = signal<boolean>(true);
  readonly identityDocuments = signal<readonly IdentityDocumentItem[]>(INITIAL_DOCS);
  readonly dashboardMode = signal<DashboardExperienceMode>('active');

  // Domain Collection Signals
  readonly beneficiaries = signal<readonly BeneficiaryItem[]>(INITIAL_BENEFICIARIES);
  readonly paymentMethods = signal<readonly PaymentMethodItem[]>(INITIAL_PAYMENT_METHODS);
  readonly balances = signal<readonly CurrencyBalance[]>(INITIAL_BALANCES);
  readonly transactions = signal<readonly RemittanceTransaction[]>(INITIAL_TRANSACTIONS);
  readonly virtualAccounts = signal<readonly VirtualReceivingAccount[]>(INITIAL_VIRTUAL_ACCOUNTS);

  // Sidebar live pill balances
  readonly inTransitUsd = signal<number>(0);
  readonly availableWalletUsd = signal<number>(200);

  // Remittance Wizard Signals
  readonly sendAmount = signal<number>(80);
  readonly sendCurrency = signal<string>('USD');
  readonly receiveCurrency = signal<string>('INR');
  readonly fxFetchFailed = signal<boolean>(false);
  readonly fxRateMultiplier = signal<number>(1);
  readonly useWalletBalance = signal<boolean>(false);
  readonly selectedBeneficiaryId = linkedSignal<readonly BeneficiaryItem[], string>({
    source: this.beneficiaries,
    computation: (list) => list[0]?.id ?? '',
  });
  readonly selectedPaymentMethodId = linkedSignal<readonly PaymentMethodItem[], string>({
    source: this.paymentMethods,
    computation: (list) => list.find((m) => m.verified)?.id ?? list[0]?.id ?? '',
  });
  readonly transferPurpose = signal<string>('Family');
  readonly transferDescription = signal<string>('');

  // Derived Computed Signals
  readonly fullName = computed(() => {
    const u = this.user();
    return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ');
  });

  readonly primaryDocument = computed(() => this.identityDocuments()[0] ?? null);

  readonly onboardingStepsCompleted = computed(() => {
    let count = 0;
    if (this.personalDetailsCompleted()) count++;
    if (this.identityDocuments().length > 0) count++;
    if (this.livenessCompleted()) count++;
    return count;
  });

  readonly banks = computed(() =>
    this.paymentMethods().filter((m): m is BankPaymentMethod => m.kind === 'bank')
  );

  readonly cards = computed(() =>
    this.paymentMethods().filter((m): m is CardPaymentMethod => m.kind === 'card')
  );

  readonly verifiedPaymentMethods = computed(() =>
    this.paymentMethods().filter((m) => m.verified)
  );

  readonly selectedBeneficiary = computed(
    () => this.beneficiaries().find((b) => b.id === this.selectedBeneficiaryId()) ?? null
  );

  readonly selectedPaymentMethod = computed(
    () => this.paymentMethods().find((m) => m.id === this.selectedPaymentMethodId()) ?? null
  );

  readonly totalHeadlineBalanceUsd = computed(() => {
    if (this.dashboardMode() === 'welcome') return 0;
    return 551091.12;
  });

  readonly inTransitTransactions = computed(() =>
    this.transactions().filter((t) => t.status === 'In Transit')
  );

  readonly offeredFxRate = computed(() => {
    const from = CURRENCIES.find((c) => c.code === this.sendCurrency())?.rateFromUsd ?? 1;
    const to = CURRENCIES.find((c) => c.code === this.receiveCurrency())?.rateFromUsd ?? 86.264;
    return Number(((to / from) * this.fxRateMultiplier()).toFixed(3));
  });

  readonly receiveAmount = computed(() => {
    if (this.fxFetchFailed()) return 0;
    return Number((this.sendAmount() * this.offeredFxRate()).toFixed(2));
  });

  readonly transferFee = computed(() => (this.sendAmount() > 0 ? 3.45 : 0));

  readonly totalPayable = computed(() => {
    const walletDeduction = this.useWalletBalance() ? Math.min(25, this.sendAmount()) : 0;
    return Number(Math.max(0, this.sendAmount() + this.transferFee() - walletDeduction).toFixed(2));
  });

  constructor() {
    this.hydrateFromStorage();

    effect(() => {
      const snapshot = {
        user: this.user(),
        personalDetailsCompleted: this.personalDetailsCompleted(),
        livenessCompleted: this.livenessCompleted(),
        identityDocuments: this.identityDocuments(),
        dashboardMode: this.dashboardMode(),
        beneficiaries: this.beneficiaries(),
        paymentMethods: this.paymentMethods(),
        transactions: this.transactions(),
        inTransitUsd: this.inTransitUsd(),
        availableWalletUsd: this.availableWalletUsd(),
      };
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(this.storageKey, JSON.stringify(snapshot));
        } catch {
          // Ignore quota errors
        }
      }
    });
  }

  private hydrateFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.user) this.user.set(parsed.user);
      if (typeof parsed.personalDetailsCompleted === 'boolean') {
        this.personalDetailsCompleted.set(parsed.personalDetailsCompleted);
      }
      if (typeof parsed.livenessCompleted === 'boolean') {
        this.livenessCompleted.set(parsed.livenessCompleted);
      }
      if (Array.isArray(parsed.identityDocuments)) {
        this.identityDocuments.set(parsed.identityDocuments);
      }
      if (parsed.dashboardMode) {
        this.dashboardMode.set(parsed.dashboardMode);
      }
      if (Array.isArray(parsed.beneficiaries)) {
        this.beneficiaries.set(parsed.beneficiaries);
      }
      if (Array.isArray(parsed.paymentMethods)) {
        this.paymentMethods.set(parsed.paymentMethods);
      }
      if (Array.isArray(parsed.transactions)) {
        this.transactions.set(parsed.transactions);
      }
      if (typeof parsed.inTransitUsd === 'number') {
        this.inTransitUsd.set(parsed.inTransitUsd);
      }
      if (typeof parsed.availableWalletUsd === 'number') {
        this.availableWalletUsd.set(parsed.availableWalletUsd);
      }
    } catch {
      // Ignore corrupt storage
    }
  }

  resetDemoState(): void {
    this.user.set(INITIAL_USER);
    this.personalDetailsCompleted.set(true);
    this.livenessCompleted.set(true);
    this.identityDocuments.set(INITIAL_DOCS);
    this.dashboardMode.set('active');
    this.beneficiaries.set(INITIAL_BENEFICIARIES);
    this.paymentMethods.set(INITIAL_PAYMENT_METHODS);
    this.transactions.set(INITIAL_TRANSACTIONS);
    this.inTransitUsd.set(0);
    this.availableWalletUsd.set(200);
  }

  registerIndividual(payload: {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    dialCode: string;
    phone: string;
    nationality: string;
    dob: string;
  }): void {
    this.user.update((prev) => ({
      ...prev,
      ...payload,
      authProvider: 'password',
      emailVerified: false,
      phoneVerified: false,
    }));
    this.personalDetailsCompleted.set(false);
    this.identityDocuments.set([]);
    this.livenessCompleted.set(false);
  }

  markContactVerified(emailOk: boolean, phoneOk: boolean): void {
    this.user.update((prev) => ({
      ...prev,
      emailVerified: prev.emailVerified || emailOk,
      phoneVerified: prev.phoneVerified || phoneOk,
    }));
  }

  loginWithEmail(email: string): void {
    this.isAuthenticated.set(true);
    this.user.update((prev) => ({ ...prev, email }));
  }

  loginWithSocial(provider: 'google' | 'apple', isNewAccount: boolean): void {
    this.isAuthenticated.set(true);
    this.user.update((prev) => ({
      ...prev,
      authProvider: provider,
      emailVerified: true,
      phoneVerified: !isNewAccount,
    }));
    if (isNewAccount) {
      this.personalDetailsCompleted.set(false);
      this.identityDocuments.set([]);
      this.livenessCompleted.set(false);
    }
  }

  logout(): void {
    this.isAuthenticated.set(false);
  }

  updatePersonalDetails(patch: {
    gender: string;
    birthPlace: string;
    address: UserAddress;
    socialAccounts: readonly SocialAccountLink[];
    occupation: string;
    employerName: string;
    dialCode?: string;
    phone?: string;
    phoneVerified?: boolean;
  }): void {
    this.user.update((prev) => ({
      ...prev,
      gender: patch.gender,
      birthPlace: patch.birthPlace,
      address: patch.address,
      socialAccounts: patch.socialAccounts,
      occupation: patch.occupation,
      employerName: patch.employerName,
      dialCode: patch.dialCode ?? prev.dialCode,
      phone: patch.phone ?? prev.phone,
      phoneVerified: patch.phoneVerified ?? prev.phoneVerified,
    }));
    this.personalDetailsCompleted.set(true);
  }

  updateProfilePatch(patch: Partial<UserProfile>): void {
    this.user.update((prev) => ({ ...prev, ...patch }));
  }

  addIdentityDocument(doc: Omit<IdentityDocumentItem, 'id' | 'status'>): void {
    const newDoc: IdentityDocumentItem = {
      ...doc,
      id: `doc-${Date.now()}`,
      status: 'Under Verification',
    };
    this.identityDocuments.update((list) => [newDoc, ...list.filter((d) => d.type !== doc.type)]);
  }

  removeIdentityDocument(id: string): { ok: boolean; reason?: 'locked' } {
    const target = this.identityDocuments().find((d) => d.id === id);
    if (target?.locked) {
      return { ok: false, reason: 'locked' };
    }
    this.identityDocuments.update((list) => list.filter((d) => d.id !== id));
    return { ok: true };
  }

  completeLivenessCheck(): void {
    this.livenessCompleted.set(true);
    this.dashboardMode.set('under_verification');
  }

  addBeneficiary(item: Omit<BeneficiaryItem, 'id' | 'dateAddedBucket' | 'verified'>): BeneficiaryItem {
    const created: BeneficiaryItem = {
      ...item,
      id: `ben-${Date.now()}`,
      dateAddedBucket: 'Today',
      verified: true,
    };
    this.beneficiaries.update((list) => [created, ...list]);
    this.selectedBeneficiaryId.set(created.id);
    return created;
  }

  removeBeneficiary(id: string, force = false): { ok: boolean; reason?: 'pending_transfer' } {
    const found = this.beneficiaries().find((b) => b.id === id);
    if (found?.hasPendingTransfer && !force) {
      return { ok: false, reason: 'pending_transfer' };
    }
    this.beneficiaries.update((list) => list.filter((b) => b.id !== id));
    return { ok: true };
  }

  addBankMethod(payload: {
    country: string;
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    routingNumber: string;
    accountType: 'Savings Account' | 'Checking Account';
    bankAddress?: string;
    setAsDefault: boolean;
  }): { item: BankPaymentMethod; hadExistingPrimary: boolean } {
    const existingPrimary = this.banks().some((b) => b.isPrimary);
    const shortCode = payload.bankName.slice(0, 2).toUpperCase();
    const created: BankPaymentMethod = {
      id: `pm-bank-${Date.now()}`,
      kind: 'bank',
      country: payload.country,
      bankName: payload.bankName,
      shortCode,
      brandColor: '#7965F0',
      accountHolderName: payload.accountHolderName,
      accountNumber: payload.accountNumber,
      routingNumber: payload.routingNumber,
      accountType: payload.accountType,
      bankAddress: payload.bankAddress,
      currency: 'USD',
      capabilities: ['Fund', 'Receive'],
      addedOn: '13 Nov 2026',
      verified: false,
      isPrimary: payload.setAsDefault && !existingPrimary,
    };

    this.paymentMethods.update((list) => {
      const updated =
        payload.setAsDefault && !existingPrimary
          ? list.map((m) => (m.kind === 'bank' ? { ...m, isPrimary: false } : m))
          : list;
      return [created, ...updated];
    });
    return { item: created, hadExistingPrimary: payload.setAsDefault && existingPrimary };
  }

  addCardMethod(payload: {
    country: string;
    issuer: string;
    cardHolderName: string;
    cardNumber: string;
    expiry: string;
    brand: CardPaymentMethod['brand'];
    billingAddress: CardPaymentMethod['billingAddress'];
    setAsDefault: boolean;
  }): { item: CardPaymentMethod; hadExistingPrimary: boolean } {
    const existingPrimary = this.cards().some((c) => c.isPrimary);
    const created: CardPaymentMethod = {
      id: `pm-card-${Date.now()}`,
      kind: 'card',
      country: payload.country,
      issuer: payload.issuer || 'Visa / Mastercard',
      cardHolderName: payload.cardHolderName,
      last4: payload.cardNumber.replace(/\D/g, '').slice(-4) || '4242',
      expiry: payload.expiry,
      brand: payload.brand === 'unknown' ? 'visa' : payload.brand,
      currency: 'USD',
      addedOn: '13 Nov 2026',
      verified: false,
      isPrimary: payload.setAsDefault && !existingPrimary,
      themeVariant: 'royal',
      billingAddress: payload.billingAddress,
    };

    this.paymentMethods.update((list) => {
      const updated =
        payload.setAsDefault && !existingPrimary
          ? list.map((m) => (m.kind === 'card' ? { ...m, isPrimary: false } : m))
          : list;
      return [created, ...updated];
    });
    return { item: created, hadExistingPrimary: payload.setAsDefault && existingPrimary };
  }

  verifyPaymentMethod(id: string): void {
    this.paymentMethods.update((list) =>
      list.map((m) => (m.id === id ? { ...m, verified: true } : m))
    );
    this.selectedPaymentMethodId.set(id);
  }

  forceSetPrimaryPaymentMethod(id: string): void {
    const target = this.paymentMethods().find((m) => m.id === id);
    if (!target) return;
    this.paymentMethods.update((list) =>
      list.map((m) =>
        m.kind === target.kind ? { ...m, isPrimary: m.id === id } : m
      )
    );
  }

  removePaymentMethod(
    id: string
  ): { ok: boolean; reason?: 'is_primary' | 'pending_tx' } {
    const target = this.paymentMethods().find((m) => m.id === id);
    if (!target) return { ok: true };
    if (target.isPrimary) return { ok: false, reason: 'is_primary' };
    if (target.hasPendingTx) return { ok: false, reason: 'pending_tx' };
    this.paymentMethods.update((list) => list.filter((m) => m.id !== id));
    return { ok: true };
  }

  submitRemittance(underReview = false): RemittanceTransaction {
    const ben = this.selectedBeneficiary();
    const recCurr = CURRENCIES.find((c) => c.code === this.receiveCurrency()) ?? CURRENCIES[1];
    const tx: RemittanceTransaction = {
      id: `R98${Math.floor(100000 + Math.random() * 899999)}`,
      date: '13 Nov 2026',
      type: `Outbound Remittance to ${ben ? ben.firstName + ' ' + ben.lastName : 'Beneficiary'}`,
      beneficiaryName: ben ? `${ben.firstName} ${ben.lastName}` : 'Recipient',
      sendCurrency: this.sendCurrency(),
      sendAmount: this.sendAmount(),
      receiveCurrency: this.receiveCurrency(),
      currencyFlag: recCurr.flag,
      displayCurrency: this.receiveCurrency(),
      displayAmount: formatMoney(this.receiveAmount(), this.receiveCurrency()),
      feeUsd: this.transferFee(),
      fxRateText: `1 ${this.sendCurrency()} = ${this.offeredFxRate()} ${this.receiveCurrency()}`,
      purpose: this.transferPurpose(),
      description: this.transferDescription(),
      status: underReview ? 'Under Review' : 'In Transit',
    };

    this.transactions.update((list) => [tx, ...list]);
    this.inTransitUsd.update((v) => Number((v + this.sendAmount()).toFixed(2)));
    if (this.dashboardMode() === 'welcome') {
      this.dashboardMode.set('active');
    }
    return tx;
  }
}
