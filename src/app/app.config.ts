import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { PRIM_API_KEY } from './config/prim.config';
import { primApiKeyInterceptor } from './interceptors/prim-api-key.interceptor';
import { primErrorInterceptor } from './interceptors/prim-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      // Les paramètres de route (`:stopAreaId`) arrivent directement dans les `input()` des pages.
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    // Ordre : la clé est ajoutée d'abord, puis les erreurs de la réponse sont converties.
    provideHttpClient(withInterceptors([primApiKeyInterceptor, primErrorInterceptor])),
    { provide: PRIM_API_KEY, useValue: environment.primApiKey }
  ]
};
