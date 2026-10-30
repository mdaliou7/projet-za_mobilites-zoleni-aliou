import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PRIM_NAVITIA_URL } from '../config/prim.config';
import { PlacesResponse } from '../models/lieux.models';
import { LieuxApi } from './lieux-api';

describe('LieuxApi', () => {
  const placesUrl = `${PRIM_NAVITIA_URL}/places`;
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

    const req = httpMock.expectOne((r) => r.url === placesUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('chatelet');
    expect(req.request.params.get('count')).toBe('3');
    req.flush({ places: [] });
  });

  it('ne refait pas la requête pour une recherche déjà faite (casse et espaces ignorés)', () => {
    const reponses: PlacesResponse[] = [];

    api.searchPlaces('Chatelet').subscribe((r) => reponses.push(r));
    httpMock.expectOne((r) => r.url === placesUrl).flush({ places: [{ id: 'a', name: 'Châtelet', embedded_type: 'stop_area' }] });

    api.searchPlaces('  chatelet ').subscribe((r) => reponses.push(r));
    httpMock.expectNone((r) => r.url === placesUrl);

    expect(reponses.length).toBe(2);
    expect(reponses[1]).toEqual(reponses[0]);
  });

  it('partage une seule requête entre deux abonnés pendant qu’elle est en cours', () => {
    api.searchPlaces('bercy').subscribe();
    api.searchPlaces('bercy').subscribe();

    httpMock.expectOne((r) => r.url === placesUrl).flush({ places: [] });
  });

  it('distingue le nombre de résultats demandé', () => {
    api.searchPlaces('bercy', 3).subscribe();
    api.searchPlaces('bercy', 10).subscribe();

    const requetes = httpMock.match((r) => r.url === placesUrl);
    expect(requetes.length).toBe(2);
    requetes.forEach((r) => r.flush({ places: [] }));
  });

  it('ne garde pas une recherche en erreur : on peut réessayer', () => {
    let erreur: unknown;
    api.searchPlaces('bercy').subscribe({ error: (e: unknown) => (erreur = e) });
    httpMock
      .expectOne((r) => r.url === placesUrl)
      .flush('KO', { status: 500, statusText: 'Server Error' });
    expect(erreur).toBeTruthy();

    api.searchPlaces('bercy').subscribe();
    httpMock.expectOne((r) => r.url === placesUrl).flush({ places: [] });
  });
});
