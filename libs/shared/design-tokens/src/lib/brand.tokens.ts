import {
  DOCUMENT,
  EnvironmentProviders,
  Injectable,
  InjectionToken,
  computed,
  effect,
  inject,
  makeEnvironmentProviders,
  signal,
} from '@angular/core';

export interface BrandConfig {
  readonly appId: string;
  readonly name: string;
  readonly badgeLabel: string;
  readonly tagline: string;
  readonly walletLabel: string;
  readonly supportEmail: string;
  readonly supportPhone: string;
  readonly version: string;
  readonly lastTermsUpdate: string;
  readonly colors: {
    readonly primary: string;
    readonly primaryHover: string;
    readonly primarySoft: string;
    readonly primaryBorder: string;
    readonly accentGreen: string;
    readonly accentGreenSoft: string;
    readonly navbarBg: string;
  };
}

export const DEFAULT_PAYGATE_BRAND: BrandConfig = {
  appId: 'wizz-finance',
  name: 'Paygate',
  badgeLabel: 'PayGate',
  tagline: 'Global Payments Made Simple & Secure',
  walletLabel: 'WIZZ Balance',
  supportEmail: 'support@wizzpaygate.com',
  supportPhone: '1800 787 1221',
  version: 'Ver 2.2.33',
  lastTermsUpdate: '2 May 2025',
  colors: {
    primary: '#7965F0',
    primaryHover: '#6650E5',
    primarySoft: '#F2F0FE',
    primaryBorder: '#DFDAFC',
    accentGreen: '#44B767',
    accentGreenSoft: '#EAF8EE',
    navbarBg: '#0E0E14',
  },
};

export const BRAND_CONFIG = new InjectionToken<BrandConfig>('WIZZ_BRAND_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_PAYGATE_BRAND,
});

export function provideBrandConfig(
  overrides: Partial<Omit<BrandConfig, 'colors'>> & { colors?: Partial<BrandConfig['colors']> }
): EnvironmentProviders {
  const merged: BrandConfig = {
    ...DEFAULT_PAYGATE_BRAND,
    ...overrides,
    colors: {
      ...DEFAULT_PAYGATE_BRAND.colors,
      ...(overrides.colors ?? {}),
    },
  };
  return makeEnvironmentProviders([{ provide: BRAND_CONFIG, useValue: merged }]);
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly initialBrand = inject(BRAND_CONFIG);

  readonly brand = signal<BrandConfig>(this.initialBrand);
  readonly brandName = computed(() => this.brand().name);
  readonly primaryColor = computed(() => this.brand().colors.primary);

  constructor() {
    effect(() => {
      const current = this.brand();
      const root = this.doc?.documentElement;
      if (!root) return;
      root.style.setProperty('--wizz-primary', current.colors.primary);
      root.style.setProperty('--wizz-primary-hover', current.colors.primaryHover);
      root.style.setProperty('--wizz-primary-soft', current.colors.primarySoft);
      root.style.setProperty('--wizz-primary-border', current.colors.primaryBorder);
      root.style.setProperty('--wizz-green', current.colors.accentGreen);
      root.style.setProperty('--wizz-green-soft', current.colors.accentGreenSoft);
      root.style.setProperty('--wizz-navbar-bg', current.colors.navbarBg);
    });
  }

  updateBrand(patch: Partial<Omit<BrandConfig, 'colors'>> & { colors?: Partial<BrandConfig['colors']> }): void {
    this.brand.update((prev) => ({
      ...prev,
      ...patch,
      colors: {
        ...prev.colors,
        ...(patch.colors ?? {}),
      },
    }));
  }
}
