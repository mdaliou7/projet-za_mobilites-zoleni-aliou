import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { primApiKeyInterceptor } from './core/prim-api-key.interceptor';
import { PRIM_API_KEY } from './core/prim.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([primApiKeyInterceptor])),
    { provide: PRIM_API_KEY, useValue: environment.primApiKey }
  ]
};
