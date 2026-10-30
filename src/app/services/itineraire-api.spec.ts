import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PRIM_API_KEY, PRIM_NAVITIA_URL } from '../config/prim.config';
import { primApiKeyInterceptor } from '../interceptors/prim-api-key.interceptor';
import { primErrorInterceptor } from '../interceptors/prim-error.interceptor';
import { JourneysResponse } from '../models/itineraire.models';
import { PrimApiError } from '../models/prim.models';
import { ItineraireApi } from './itineraire-api';

describe('ItineraireApi', () => {
  const journeysUrl = `${PRIM_NAVITIA_URL}/journeys`;
  let api: ItineraireApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        // Mêmes intercepteurs que l'application : les erreurs HTTP arrivent en PrimApiError.
        provideHttpClient(withInterceptors([primApiKeyInterceptor, primErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: PRIM_API_KEY, useValue: 'cle-de-test' },
      ],
    });
    api = TestBed.inject(ItineraireApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  /** Lance un calcul et répond par une erreur HTTP ; renvoie ce que le service a émis. */
  function failWith(status: number, body: string | object) {
    const result: { value?: JourneysResponse; error?: unknown } = {};
    api.getJourneys('a', 'b').subscribe({
      next: (v) => (result.value = v),
      error: (e: unknown) => (result.error = e),
    });
    httpMock.expectOne((r) => r.url === journeysUrl).flush(body, { status, statusText: 'KO' });
    return result;
  }

  it('getJourneys appelle /journeys, avec datetime seulement si fourni', () => {
    api.getJourneys('2.3470;48.8584', 'stop_area:IDFM:71264').subscribe();
    const sansDate = httpMock.expectOne((r) => r.url === journeysUrl);
    expect(sansDate.request.params.get('from')).toBe('2.3470;48.8584');
    expect(sansDate.request.params.get('to')).toBe('stop_area:IDFM:71264');
    expect(sansDate.request.params.has('datetime')).toBe(false);
    sansDate.flush({ journeys: [] });

    api.getJourneys('a', 'b', { datetime: '20261201T080000', count: 1 }).subscribe();
    const avecDate = httpMock.expectOne((r) => r.url === journeysUrl);
    expect(avecDate.request.params.get('datetime')).toBe('20261201T080000');
    expect(avecDate.request.params.get('count')).toBe('1');
    avecDate.flush({ journeys: [] });
  });

  it('traite « aucun trajet » (404 no_solution) comme une liste vide, pas comme une erreur', () => {
    // Corps réel d'une réponse PRIM sans solution.
    const result = failWith(404, { error: { id: 'no_solution', message: 'no solution found for this journey' } });

    expect(result.error).toBeUndefined();
    expect(result.value).toEqual({ journeys: [] });
  });

  it.each([
    ['no_origin', 'départ'],
    ['no_destination', 'arrivée'],
    ['date_out_of_bounds', 'période couverte'],
  ])("traduit l'erreur Navitia « %s » en message clair", (id, extrait) => {
    const result = failWith(404, { error: { id, message: 'x' } });

    expect(result.error).toBeInstanceOf(PrimApiError);
    expect((result.error as PrimApiError).message).toContain(extrait);
    expect((result.error as PrimApiError).status).toBe(404);
  });

  it('laisse passer les autres erreurs telles quelles', () => {
    const inconnue = failWith(404, { error: { id: 'unknown_object' } });
    expect(inconnue.error).toBeInstanceOf(PrimApiError);
    expect((inconnue.error as PrimApiError).message).toContain('introuvable');

    const panne = failWith(503, 'indisponible');
    expect((panne.error as PrimApiError).kind).toBe('server');
  });
});
