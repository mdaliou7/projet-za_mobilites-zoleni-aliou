import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, catchError, shareReplay, throwError } from 'rxjs';
import { PRIM_NAVITIA_URL } from '../config/prim.config';
import { PlacesResponse } from '../models/lieux.models';

/** Nombre maximal de recherches gardées en mémoire (les plus anciennes sont oubliées). */
const CACHE_SIZE = 50;

/** Recherche de lieux : adresses, arrêts, gares (API Calculateur). */
@Service()
export class LieuxApi {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, Observable<PlacesResponse>>();

  /**
   * Max 200 résultats par page. L'en-tête `apiKey` est ajouté par l'intercepteur.
   *
   * Les réponses sont gardées en mémoire : redemander la même recherche (même avec une autre
   * casse ou des espaces en trop) ne renvoie aucune requête, donc ne consomme pas de quota.
   * Une recherche en erreur n'est pas gardée, pour pouvoir réessayer.
   */
  searchPlaces(query: string, count = 5): Observable<PlacesResponse> {
    const q = query.trim();
    const key = `${count}|${q.toLowerCase()}`;

    let request$ = this.cache.get(key);
    if (!request$) {
      const params = new HttpParams().set('q', q).set('count', count);
      request$ = this.http.get<PlacesResponse>(`${PRIM_NAVITIA_URL}/places`, { params }).pipe(
        catchError((error: unknown) => {
          this.cache.delete(key);
          return throwError(() => error);
        }),
        shareReplay(1),
      );
      if (this.cache.size >= CACHE_SIZE) {
        this.cache.delete(this.cache.keys().next().value as string);
      }
      this.cache.set(key, request$);
    }
    return request$;
  }
}
