import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PRIM_LINE_REPORTS_URL } from '../config/prim.config';
import { TraficApi } from './trafic-api';

describe('TraficApi', () => {
  let api: TraficApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(TraficApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('appelle /line_reports/line_reports (et non la racine de la couverture)', () => {
    api.getTrafficReports({ count: 2 }).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${PRIM_LINE_REPORTS_URL}/line_reports`);
    expect(req.request.params.get('count')).toBe('2');
    req.flush({ line_reports: [], disruptions: [] });
  });

  it('filtre par mode dans le chemin', () => {
    api.getTrafficReports({ physicalMode: 'physical_mode:Metro', count: 100 }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${PRIM_LINE_REPORTS_URL}/physical_modes/physical_mode%3AMetro/line_reports`,
    );
    expect(req.request.params.get('count')).toBe('100');
    req.flush({ line_reports: [] });
  });

  it('filtre par ligne dans le chemin', () => {
    api.getTrafficReports({ lineId: 'line:IDFM:C01727' }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${PRIM_LINE_REPORTS_URL}/lines/line%3AIDFM%3AC01727/line_reports`,
    );
    req.flush({ line_reports: [] });
  });

  it('exclut des modes avec forbidden_uris[]', () => {
    api.getTrafficReports({ excludeModes: ['physical_mode:Bus'], startPage: 1 }).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${PRIM_LINE_REPORTS_URL}/line_reports`);
    expect(req.request.params.getAll('forbidden_uris[]')).toEqual(['physical_mode:Bus']);
    expect(req.request.params.get('start_page')).toBe('1');
    expect(req.request.urlWithParams).toContain('forbidden_uris%5B%5D=physical_mode:Bus');
    req.flush({ line_reports: [] });
  });
});
