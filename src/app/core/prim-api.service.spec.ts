import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PrimApiService } from './prim-api.service';
import { PRIM_BASE_URL, PRIM_LINE_REPORTS_URL, PRIM_NAVITIA_URL } from './prim.config';

describe('PrimApiService', () => {
  let service: PrimApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PrimApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('searchPlaces appelle /places avec q et count', () => {
    service.searchPlaces('chatelet', 3).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${PRIM_NAVITIA_URL}/places`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('chatelet');
    expect(req.request.params.get('count')).toBe('3');
    req.flush({ places: [] });
  });

  it('getJourneys appelle /journeys, avec datetime seulement si fourni', () => {
    service.getJourneys('2.3470;48.8584', 'stop_area:IDFM:71264').subscribe();
    const sansDate = httpMock.expectOne((r) => r.url === `${PRIM_NAVITIA_URL}/journeys`);
    expect(sansDate.request.params.get('from')).toBe('2.3470;48.8584');
    expect(sansDate.request.params.get('to')).toBe('stop_area:IDFM:71264');
    expect(sansDate.request.params.has('datetime')).toBe(false);
    sansDate.flush({ journeys: [] });

    service.getJourneys('a', 'b', { datetime: '20261201T080000', count: 1 }).subscribe();
    const avecDate = httpMock.expectOne((r) => r.url === `${PRIM_NAVITIA_URL}/journeys`);
    expect(avecDate.request.params.get('datetime')).toBe('20261201T080000');
    expect(avecDate.request.params.get('count')).toBe('1');
    avecDate.flush({ journeys: [] });
  });

  it('getTrafficReports appelle /line_reports/line_reports (et non la racine de la couverture)', () => {
    service.getTrafficReports({ count: 2 }).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${PRIM_LINE_REPORTS_URL}/line_reports`);
    expect(req.request.params.get('count')).toBe('2');
    req.flush({ line_reports: [], disruptions: [] });
  });

  it('getTrafficReports filtre par mode dans le chemin', () => {
    service.getTrafficReports({ physicalMode: 'physical_mode:Metro', count: 100 }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${PRIM_LINE_REPORTS_URL}/physical_modes/physical_mode%3AMetro/line_reports`,
    );
    expect(req.request.params.get('count')).toBe('100');
    req.flush({ line_reports: [] });
  });

  it('getTrafficReports filtre par ligne dans le chemin', () => {
    service.getTrafficReports({ lineId: 'line:IDFM:C01727' }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${PRIM_LINE_REPORTS_URL}/lines/line%3AIDFM%3AC01727/line_reports`,
    );
    req.flush({ line_reports: [] });
  });

  it('getTrafficReports exclut des modes avec forbidden_uris[]', () => {
    service.getTrafficReports({ excludeModes: ['physical_mode:Bus'], startPage: 1 }).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${PRIM_LINE_REPORTS_URL}/line_reports`);
    expect(req.request.params.getAll('forbidden_uris[]')).toEqual(['physical_mode:Bus']);
    expect(req.request.params.get('start_page')).toBe('1');
    expect(req.request.urlWithParams).toContain('forbidden_uris%5B%5D=physical_mode:Bus');
    req.flush({ line_reports: [] });
  });

  it('getNextDepartures appelle /stop-monitoring avec MonitoringRef', () => {
    service.getNextDepartures('STIF:StopArea:SP:71264:').subscribe();

    const req = httpMock.expectOne((r) => r.url === `${PRIM_BASE_URL}/stop-monitoring`);
    expect(req.request.params.get('MonitoringRef')).toBe('STIF:StopArea:SP:71264:');
    req.flush({});
  });
});
