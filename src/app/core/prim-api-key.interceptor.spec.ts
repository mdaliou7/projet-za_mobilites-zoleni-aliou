import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { primApiKeyInterceptor } from './prim-api-key.interceptor';
import { PrimUsageService } from './prim-usage.service';
import { PRIM_API_KEY, PRIM_BASE_URL } from './prim.config';

describe('primApiKeyInterceptor', () => {
  function setup(apiKey: string) {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([primApiKeyInterceptor])),
        provideHttpClientTesting(),
        { provide: PRIM_API_KEY, useValue: apiKey },
      ],
    });
    return {
      http: TestBed.inject(HttpClient),
      httpMock: TestBed.inject(HttpTestingController),
      usage: TestBed.inject(PrimUsageService),
    };
  }

  it("ajoute l'en-tête apiKey aux requêtes vers PRIM et les compte", () => {
    const { http, httpMock, usage } = setup('cle-de-test');

    http.get(`${PRIM_BASE_URL}/v2/navitia/places`).subscribe();

    const req = httpMock.expectOne(`${PRIM_BASE_URL}/v2/navitia/places`);
    expect(req.request.headers.get('apiKey')).toBe('cle-de-test');
    expect(usage.requestsToday()).toBe(1);
    httpMock.verify();
  });

  it("n'envoie jamais la clé à un autre serveur", () => {
    const { http, httpMock, usage } = setup('cle-de-test');

    http.get('https://example.com/data').subscribe();

    const req = httpMock.expectOne('https://example.com/data');
    expect(req.request.headers.has('apiKey')).toBe(false);
    expect(usage.requestsToday()).toBe(0);
    httpMock.verify();
  });

  it("refuse d'envoyer la requête quand la clé est absente", () => {
    const { http, httpMock, usage } = setup('');
    let message = '';

    http.get(`${PRIM_BASE_URL}/v2/navitia/places`).subscribe({
      error: (e: Error) => (message = e.message),
    });

    httpMock.expectNone(`${PRIM_BASE_URL}/v2/navitia/places`);
    expect(message).toContain('PRIM_API_KEY');
    expect(usage.requestsToday()).toBe(0);
  });
});
