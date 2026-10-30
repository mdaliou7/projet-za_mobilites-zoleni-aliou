import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PRIM_BASE_URL } from '../config/prim.config';
import { StopMonitoringResponse } from '../models/horaires.models';

/** Prochains passages en temps réel (API Prochains passages, format SIRI Lite). */
@Service()
export class HorairesApi {
  private readonly http = inject(HttpClient);

  /**
   * `monitoringRef` est un identifiant du référentiel d'arrêts, différent de ceux du Calculateur :
   * `STIF:StopArea:SP:71264:` (zone d'arrêts, à privilégier) ou `STIF:StopPoint:Q:XXXXX:` (quai,
   * un seul sens). Le temps réel n'existe que sur une partie du réseau.
   */
  getNextDepartures(monitoringRef: string): Observable<StopMonitoringResponse> {
    const params = new HttpParams().set('MonitoringRef', monitoringRef);
    return this.http.get<StopMonitoringResponse>(`${PRIM_BASE_URL}/stop-monitoring`, { params });
  }
}
