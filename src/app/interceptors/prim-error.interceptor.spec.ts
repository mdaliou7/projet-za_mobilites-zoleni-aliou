import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PRIM_BASE_URL } from '../config/prim.config';
import { PrimApiError, PrimErrorKind } from '../models/prim.models';
import { primErrorInterceptor } from './prim-error.interceptor';

describe('primErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([primErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  function failWith(url: string, status: number): unknown {
    let error: unknown;
    http.get(url).subscribe({ error: (e: unknown) => (error = e) });
    httpMock.expectOne(url).flush({ detail: 'x' }, { status, statusText: 'KO' });
    return error;
  }

  it.each<[number, PrimErrorKind]>([
    [401, 'unauthorized'],
    [403, 'unauthorized'],
    [404, 'not-found'],
    [429, 'quota'],
    [500, 'server'],
    [503, 'server'],
    [418, 'unknown'],
  ])('transforme un statut %i en PrimApiError « %s »', (status, kind) => {
    const error = failWith(`${PRIM_BASE_URL}/v2/navitia/places`, status);

    expect(error).toBeInstanceOf(PrimApiError);
    expect((error as PrimApiError).kind).toBe(kind);
    expect((error as PrimApiError).status).toBe(status);
    expect((error as PrimApiError).body).toEqual({ detail: 'x' });
  });

  it('signale une panne réseau ou un blocage CORS (statut 0)', () => {
    let error: unknown;
    http.get(`${PRIM_BASE_URL}/x`).subscribe({ error: (e: unknown) => (error = e) });
    httpMock.expectOne(`${PRIM_BASE_URL}/x`).error(new ProgressEvent('error'));

    expect((error as PrimApiError).kind).toBe('network');
    expect((error as PrimApiError).message).toContain('CORS');
  });

  it("laisse passer telles quelles les erreurs d'un autre serveur", () => {
    let error: unknown;
    http.get('https://example.com/x').subscribe({ error: (e: unknown) => (error = e) });
    httpMock.expectOne('https://example.com/x').flush('KO', { status: 500, statusText: 'KO' });

    expect(error).not.toBeInstanceOf(PrimApiError);
  });
});
