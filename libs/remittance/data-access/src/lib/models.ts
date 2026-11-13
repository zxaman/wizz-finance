import { CardBrand } from '@wizz/utils';

export type ProfileType = 'individual' | 'organization';
export type AddressCategory = 'Residential' | 'Primary Business' | 'Incorporated' | 'Other';
export type DashboardExperienceMode = 'active' | 'welcome' | 'under_verification';

export interface UserAddress {
  readonly type: AddressCategory;
  readonly country: string;
  readonly line1: string;
  readonly line2: string;
  readonly city: string;
  readonly state: string;
  readonly zipCode: string;
}

export interface SocialAccountLink {
  readonly id: string;
  readonly platform: 'Instagram' | 'LinkedIn' | 'Facebook' | 'X (Twitter)' | 'TikTok';
  readonly url: string;
}

export interface IdentityDocumentItem {
  readonly id: string;
  readonly type: 'National ID Card' | 'SSN Card' | 'Passport' | 'Driving License' | 'Others';
  readonly country: string;
  readonly documentNumber: string;
  readonly issuedBy: string;
  readonly issuedDate: string;
  readonly expirationDate: string;
  readonly frontFileName: string;
  readonly backFileName?: string;
  readonly status: 'Under Verification' | 'Verified';
  readonly locked?: boolean;
}

export interface UserProfile {
  readonly profileType: ProfileType;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly email: string;
  readonly dialCode: string;
  readonly phone: string;
  readonly nationality: string;
  readonly dob: string;
  readonly gender: string;
  readonly birthPlace: string;
  readonly address: UserAddress;
  readonly socialAccounts: readonly SocialAccountLink[];
  readonly taxCountry: string;
  readonly taxId: string;
  readonly occupation: string;
  readonly employerName: string;
  readonly authProvider: 'password' | 'google' | 'apple';
  readonly emailVerified: boolean;
  readonly phoneVerified: boolean;
  readonly mfaEnabled: boolean;
  readonly updatedTermsAccepted: boolean;
}

export interface BeneficiaryItem {
  readonly id: string;
  readonly type: 'Individual' | 'Business';
  readonly firstName: string;
  readonly middleName?: string;
  readonly lastName: string;
  readonly email: string;
  readonly dialCode: string;
  readonly phone: string;
  readonly dob: string;
  readonly gender: string;
  readonly nationality: string;
  readonly occupation: string;
  readonly placeOfBirth: string;
  readonly relationship: 'Family' | 'Corporate' | 'Friend' | 'Client' | 'Self';
  readonly documentNumber?: string;
  readonly documentType?: string;
  readonly documentCountry?: string;
  readonly documentIssuedDate?: string;
  readonly documentExpirationDate?: string;
  readonly address: {
    readonly country: string;
    readonly line1: string;
    readonly line2: string;
    readonly zipCode: string;
    readonly city: string;
    readonly state: string;
  };
  readonly bank: {
    readonly bankName: string;
    readonly accountHolderName: string;
    readonly accountNumber: string;
    readonly routingNumber: string;
    readonly accountType: 'Savings Account' | 'Checking Account';
  };
  readonly dateAddedBucket: 'Today' | 'Yesterday' | 'This Week' | 'Last Week' | 'This Month';
  readonly verified: boolean;
  readonly hasPendingTransfer?: boolean;
  readonly bankUnavailable?: boolean;
}

export interface BankPaymentMethod {
  readonly id: string;
  readonly kind: 'bank';
  readonly country: string;
  readonly bankName: string;
  readonly shortCode: string;
  readonly brandColor: string;
  readonly accountHolderName: string;
  readonly accountNumber: string;
  readonly routingNumber: string;
  readonly accountType: 'Savings Account' | 'Checking Account';
  readonly bankAddress?: string;
  readonly currency: string;
  readonly capabilities: readonly ('Fund' | 'Receive' | 'Payout Only')[];
  readonly addedOn: string;
  readonly verified: boolean;
  readonly isPrimary: boolean;
  readonly hasPendingTx?: boolean;
}

export interface CardPaymentMethod {
  readonly id: string;
  readonly kind: 'card';
  readonly country: string;
  readonly issuer: string;
  readonly cardHolderName: string;
  readonly last4: string;
  readonly expiry: string;
  readonly brand: CardBrand;
  readonly currency: string;
  readonly addedOn: string;
  readonly verified: boolean;
  readonly isPrimary: boolean;
  readonly themeVariant: 'charcoal' | 'navy' | 'royal' | 'slate';
  readonly billingAddress: {
    readonly country: string;
    readonly line1: string;
    readonly line2: string;
    readonly city: string;
    readonly state: string;
    readonly zipCode: string;
  };
  readonly hasPendingTx?: boolean;
}

export type PaymentMethodItem = BankPaymentMethod | CardPaymentMethod;

export interface CurrencyBalance {
  readonly currency: string;
  readonly label: string;
  readonly flag: string;
  readonly symbol: string;
  readonly amount: number;
  readonly shareOfTotal: string;
}

export interface RemittanceTransaction {
  readonly id: string;
  readonly date: string;
  readonly type: string;
  readonly beneficiaryName: string;
  readonly sendCurrency: string;
  readonly sendAmount: number;
  readonly receiveCurrency: string;
  readonly currencyFlag: string;
  readonly displayCurrency: string;
  readonly displayAmount: string;
  readonly feeUsd: number;
  readonly fxRateText: string;
  readonly purpose: string;
  readonly description?: string;
  readonly status: 'In Transit' | 'Completed' | 'Under Review';
}

export interface VirtualReceivingAccount {
  readonly id: string;
  readonly currency: string;
  readonly currencyName: string;
  readonly flag: string;
  readonly bankName: string;
  readonly accountHolder: string;
  readonly accountNumber: string;
  readonly routingLabel: string;
  readonly routingValue: string;
  readonly status: 'Active';
}
