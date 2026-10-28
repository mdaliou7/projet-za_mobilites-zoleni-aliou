import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PRIM_NAVITIA_URL } from '../config/prim.config';
import { LieuxApi } from './lieux-api';

describe('LieuxApi', () => {
  let api: LieuxApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(LieuxApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('searchPlaces appelle /places avec q et count', () => {
    api.searchPlaces('chatelet', 3).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${PRIM_NAVITIA_URL}/places`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('chatelet');
    expect(req.request.params.get('count')).toBe('3');
    req.flush({ places: [] });
  });
});
