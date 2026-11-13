export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export interface PasswordValidationResult {
  readonly minLength: boolean;
  readonly hasUppercase: boolean;
  readonly hasLowercase: boolean;
  readonly hasNumber: boolean;
  readonly hasSymbol: boolean;
  readonly isValid: boolean;
}

export function validateStrongPassword(password: string): PasswordValidationResult {
  const minLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  return {
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSymbol,
    isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSymbol,
  };
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function calculateAge(dobIso: string, referenceDate = new Date()): number {
  if (!dobIso) return 0;
  const dob = new Date(dobIso);
  if (Number.isNaN(dob.getTime())) return 0;
  let age = referenceDate.getFullYear() - dob.getFullYear();
  const monthDiff = referenceDate.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function isAdult(dobIso: string, minAge = 18): boolean {
  return calculateAge(dobIso) >= minAge;
}

export function detectCardBrand(rawDigits: string): CardBrand {
  const digits = rawDigits.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  return 'unknown';
}

export function requiredCvvLength(brand: CardBrand): number {
  return brand === 'amex' ? 4 : 3;
}

export function isValidCvvForBrand(cvv: string, brand: CardBrand): boolean {
  const clean = cvv.replace(/\D/g, '');
  return clean.length === requiredCvvLength(brand);
}
