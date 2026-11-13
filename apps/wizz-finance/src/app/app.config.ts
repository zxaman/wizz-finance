import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideWizzIcons } from '@wizz/ui';
import { provideBrandConfig, DEFAULT_PAYGATE_BRAND } from '@wizz/design-tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideBrandConfig(DEFAULT_PAYGATE_BRAND),
    provideWizzIcons(),
  ],
};
