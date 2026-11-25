import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { PRIM_NAVITIA_URL } from '../config/prim.config';
import { JourneyOptions, JourneysResponse } from '../models/itineraire.models';
import { PrimApiError } from '../models/prim.models';

/**
 * Erreurs métier de Navitia (identifiant dans `body.error.id`) traduites en message clair.
 * `no_solution` est vu en réel ; les autres sont ceux de la documentation Navitia.
 */
const JOURNEY_ERROR_MESSAGES: Record<string, string> = {
  no_origin: "Aucun arrêt accessible à pied autour du départ. Essaie un autre lieu de départ.",
  no_destination: "Aucun arrêt accessible à pied autour de l'arrivée. Essaie un autre lieu d'arrivée.",
  no_origin_nor_destination: 'Aucun arrêt accessible à pied autour du départ ni de l’arrivée.',
  date_out_of_bounds: 'Cette date est en dehors de la période couverte par les horaires.',
};

/** Calcul d'itinéraires (API Calculateur). */
@Service()
export class ItineraireApi {
  private readonly http = inject(HttpClient);

  /**
   * `from` et `to` valent soit des coordonnées `longitude;latitude`, soit un identifiant Navitia
   * renvoyé par `LieuxApi.searchPlaces` (ex. `stop_area:IDFM:71264`).
   *
   * Quand aucun trajet n'existe, l'API répond par une erreur 404 (`no_solution`) : ce n'est pas une
   * panne, donc on renvoie une liste vide plutôt qu'une erreur.
   */
  getJourneys(from: string, to: string, options: JourneyOptions = {}): Observable<JourneysResponse> {
    let params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('count', options.count ?? 3);
    if (options.datetime) {
      params = params.set('datetime', options.datetime);
    }
    return this.http.get<JourneysResponse>(`${PRIM_NAVITIA_URL}/journeys`, { params }).pipe(
      catchError((error: unknown) => {
        const navitiaId = error instanceof PrimApiError ? errorIdOf(error.body) : undefined;
        if (navitiaId === 'no_solution') {
          return of<JourneysResponse>({ journeys: [] });
        }
        if (error instanceof PrimApiError && navitiaId && JOURNEY_ERROR_MESSAGES[navitiaId]) {
          return throwError(
            () => new PrimApiError(error.kind, JOURNEY_ERROR_MESSAGES[navitiaId], error.status, error.body),
          );
        }
        return throwError(() => error);
      }),
    );
  }
}

/** Lit `body.error.id` dans une réponse d'erreur Navitia. */
function errorIdOf(body: unknown): string | undefined {
  const id = (body as { error?: { id?: unknown } } | null | undefined)?.error?.id;
  return typeof id === 'string' ? id : undefined;
}
