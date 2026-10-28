import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PRIM_NAVITIA_URL } from '../config/prim.config';
import { JourneyOptions, JourneysResponse } from '../models/itineraire.models';

/** Calcul d'itinéraires (API Calculateur). */
@Service()
export class ItineraireApi {
  private readonly http = inject(HttpClient);

  /**
   * `from` et `to` valent soit des coordonnées `longitude;latitude`, soit un identifiant Navitia
   * renvoyé par `LieuxApi.searchPlaces` (ex. `stop_area:IDFM:71264`).
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
}
