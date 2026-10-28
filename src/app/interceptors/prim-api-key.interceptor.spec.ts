import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PRIM_API_KEY, PRIM_BASE_URL } from '../config/prim.config';
import { PrimApiError } from '../models/prim.models';
import { PrimUsage } from '../services/prim-usage';
import { primApiKeyInterceptor } from './prim-api-key.interceptor';

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
      usage: TestBed.inject(PrimUsage),
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
    let error: unknown;

    http.get(`${PRIM_BASE_URL}/v2/navitia/places`).subscribe({ error: (e: unknown) => (error = e) });

    httpMock.expectNone(`${PRIM_BASE_URL}/v2/navitia/places`);
    expect(error).toBeInstanceOf(PrimApiError);
    expect((error as PrimApiError).kind).toBe('missing-key');
    expect((error as PrimApiError).message).toContain('PRIM_API_KEY');
    expect(usage.requestsToday()).toBe(0);
  });
});
