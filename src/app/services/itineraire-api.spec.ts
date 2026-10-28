import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PRIM_NAVITIA_URL } from '../config/prim.config';
import { ItineraireApi } from './itineraire-api';

describe('ItineraireApi', () => {
  let api: ItineraireApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ItineraireApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getJourneys appelle /journeys, avec datetime seulement si fourni', () => {
    api.getJourneys('2.3470;48.8584', 'stop_area:IDFM:71264').subscribe();
    const sansDate = httpMock.expectOne((r) => r.url === `${PRIM_NAVITIA_URL}/journeys`);
    expect(sansDate.request.params.get('from')).toBe('2.3470;48.8584');
    expect(sansDate.request.params.get('to')).toBe('stop_area:IDFM:71264');
    expect(sansDate.request.params.has('datetime')).toBe(false);
    sansDate.flush({ journeys: [] });

    api.getJourneys('a', 'b', { datetime: '20261201T080000', count: 1 }).subscribe();
    const avecDate = httpMock.expectOne((r) => r.url === `${PRIM_NAVITIA_URL}/journeys`);
    expect(avecDate.request.params.get('datetime')).toBe('20261201T080000');
    expect(avecDate.request.params.get('count')).toBe('1');
    avecDate.flush({ journeys: [] });
  });
});
