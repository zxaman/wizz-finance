export interface CountryOption {
  readonly code: string;
  readonly name: string;
  readonly dialCode: string;
  readonly flag: string;
  readonly currency: string;
}

export interface CurrencyInfo {
  readonly code: string;
  readonly name: string;
  readonly symbol: string;
  readonly flag: string;
  readonly rateFromUsd: number;
}

export const COUNTRIES: readonly CountryOption[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', currency: 'USD' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', currency: 'INR' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', currency: 'AED' },
  { code: 'GB', name: 'England / United Kingdom', dialCode: '+44', flag: '🇬🇧', currency: 'GBP' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', currency: 'NGN' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', currency: 'MXN' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', currency: 'EUR' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', currency: 'SEK' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼', currency: 'RWF' },
  { code: 'CM', name: 'Cameroon', dialCode: '+237', flag: '🇨🇲', currency: 'XAF' },
  { code: 'MW', name: 'Malawi', dialCode: '+265', flag: '🇲🇼', currency: 'MWK' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', currency: 'CAD' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', currency: 'PHP' },
];

export const CURRENCIES: readonly CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollars', symbol: '$', flag: '🇺🇸', rateFromUsd: 1 },
  { code: 'INR', name: 'Indian Rupees', symbol: '₹', flag: '🇮🇳', rateFromUsd: 86.264 },
  { code: 'AED', name: 'UAE Dirhams', symbol: 'AED ', flag: '🇦🇪', rateFromUsd: 3.6725 },
  { code: 'GBP', name: 'GB Pounds', symbol: '£', flag: '🇬🇧', rateFromUsd: 0.789 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', rateFromUsd: 0.924 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬', rateFromUsd: 1585.5 },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', rateFromUsd: 58.12 },
];

export const LANDING_COVERAGE_COUNTRIES: readonly { name: string; flag: string }[] = [
  { name: 'Rwanda', flag: '🇷🇼' },
  { name: 'Nigeria', flag: '🇳🇬' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Mexico', flag: '🇲🇽' },
  { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Cameroon', flag: '🇨🇲' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Malawi', flag: '🇲🇼' },
  { name: 'Sweden', flag: '🇸🇪' },
];
