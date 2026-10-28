import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PRIM_BASE_URL } from '../config/prim.config';
import { HorairesApi } from './horaires-api';

describe('HorairesApi', () => {
  let api: HorairesApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(HorairesApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getNextDepartures appelle /stop-monitoring avec MonitoringRef', () => {
    api.getNextDepartures('STIF:StopArea:SP:71264:').subscribe();

    const req = httpMock.expectOne((r) => r.url === `${PRIM_BASE_URL}/stop-monitoring`);
    expect(req.request.params.get('MonitoringRef')).toBe('STIF:StopArea:SP:71264:');
    req.flush({});
  });
});
