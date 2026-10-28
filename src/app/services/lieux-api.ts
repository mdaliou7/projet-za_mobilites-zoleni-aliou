import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PRIM_NAVITIA_URL } from '../config/prim.config';
import { PlacesResponse } from '../models/lieux.models';

/** Recherche de lieux : adresses, arrêts, gares (API Calculateur). */
@Service()
export class LieuxApi {
  private readonly http = inject(HttpClient);

  /** Max 200 résultats par page. L'en-tête `apiKey` est ajouté par l'intercepteur. */
  searchPlaces(query: string, count = 5): Observable<PlacesResponse> {
    const params = new HttpParams().set('q', query).set('count', count);
    return this.http.get<PlacesResponse>(`${PRIM_NAVITIA_URL}/places`, { params });
  }
}
