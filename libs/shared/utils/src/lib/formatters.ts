export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'a****@gmail.com';
  const [local, domain] = email.split('@');
  const first = local[0] ?? 'a';
  return `${first}****@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return '(012) 918******00';
  const first3 = digits.slice(0, 3);
  const next3 = digits.slice(3, 6);
  const last2 = digits.slice(-2);
  return `(${first3}) ${next3}******${last2}`;
}

export function maskAccountNumber(account: string, style: 'grouped' | 'compact' = 'grouped'): string {
  const clean = account.replace(/\s+/g, '');
  if (clean.length <= 4) return `**** ${clean}`;
  const first2 = clean.slice(0, 2);
  const last2 = clean.slice(-2);
  const last4 = clean.slice(-4);
  if (style === 'compact') {
    return `********${last4}`;
  }
  return `${first2}** **** **${last2}`;
}

export function formatCardDisplay(digits: string): string {
  const clean = digits.replace(/\D/g, '').slice(0, 16);
  return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PG';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatMoney(amount: number, currency = 'USD'): string {
  const symbols: Record<string, string> = {
    USD: '$',
    INR: '₹',
    GBP: '£',
    EUR: '€',
    AED: 'AED ',
    NGN: '₦',
    CAD: 'CA$',
    PHP: '₱',
  };
  const prefix = symbols[currency] ?? `${currency} `;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${prefix}${formatted}`;
}
