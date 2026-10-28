import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  JourneysResponse,
  LineReportsResponse,
  PlacesResponse,
  StopMonitoringResponse,
} from './prim.models';
import { PRIM_BASE_URL, PRIM_NAVITIA_URL } from './prim.config';

export interface JourneyOptions {
  /** Format Navitia : AAAAMMJJTHHMMSS. Par défaut : maintenant. */
  datetime?: string;
  count?: number;
}

/**
 * Point d'entrée unique vers les API PRIM : les composants n'appellent jamais `HttpClient`
 * eux-mêmes. L'en-tête `apiKey` est ajouté par `primApiKeyInterceptor`.
 */
@Injectable({ providedIn: 'root' })
export class PrimApiService {
  private readonly http = inject(HttpClient);

  /** Calculateur : recherche de lieux (adresses, arrêts, gares). Max 200 résultats par page. */
  searchPlaces(query: string, count = 5): Observable<PlacesResponse> {
    const params = new HttpParams().set('q', query).set('count', count);
    return this.http.get<PlacesResponse>(`${PRIM_NAVITIA_URL}/places`, { params });
  }

  /**
   * Calculateur : itinéraires. `from` et `to` valent soit des coordonnées `longitude;latitude`,
   * soit un identifiant Navitia renvoyé par `searchPlaces` (ex. `stop_area:IDFM:71264`).
   */
  getJourneys(from: string, to: string, options: JourneyOptions = {}): Observable<JourneysResponse> {
    let params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('count', options.count ?? 3);
    if (options.datetime) {
      params = params.set('datetime', options.datetime);
    }
    return this.http.get<JourneysResponse>(`${PRIM_NAVITIA_URL}/journeys`, { params });
  }

  /** Messages Info Trafic : perturbations en cours et à venir. Max 100 résultats par page. */
  getTrafficReports(count = 5): Observable<LineReportsResponse> {
    const params = new HttpParams().set('count', count);
    return this.http.get<LineReportsResponse>(`${PRIM_NAVITIA_URL}/line_reports`, { params });
  }

  /**
   * Prochains passages en temps réel (SIRI Lite). `monitoringRef` est un identifiant du
   * référentiel d'arrêts, différent de ceux du Calculateur : `STIF:StopArea:SP:71264:`
   * (zone d'arrêts, à privilégier) ou `STIF:StopPoint:Q:XXXXX:` (quai, un seul sens).
   */
  getNextDepartures(monitoringRef: string): Observable<StopMonitoringResponse> {
    const params = new HttpParams().set('MonitoringRef', monitoringRef);
    return this.http.get<StopMonitoringResponse>(`${PRIM_BASE_URL}/stop-monitoring`, { params });
  }
}
