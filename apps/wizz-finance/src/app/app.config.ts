import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideWizzIcons } from '@wizz/ui';
import { provideBrandConfig, DEFAULT_PAYGATE_BRAND } from '@wizz/design-tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideBrandConfig(DEFAULT_PAYGATE_BRAND),
    provideWizzIcons(),
  ],
};
