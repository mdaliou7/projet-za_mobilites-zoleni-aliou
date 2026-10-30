import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { PRIM_BASE_URL } from '../config/prim.config';
import { PrimApiError } from '../models/prim.models';

/**
 * Transforme toute erreur HTTP d'une API PRIM en `PrimApiError` : les composants affichent
 * `error.message` sans connaître les codes HTTP.
 */
export const primErrorInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(PRIM_BASE_URL)) {
    return next(req);
  }
  return next(req).pipe(
    catchError((error: unknown) =>
      throwError(() => (error instanceof HttpErrorResponse ? toPrimError(error) : error)),
    ),
  );
};

export function toPrimError(error: HttpErrorResponse): PrimApiError {
  const { status } = error;
  if (status === 0) {
    return new PrimApiError('network', 'Pas de réponse : réseau coupé ou blocage CORS.', status);
  }
  if (status === 401 || status === 403) {
    return new PrimApiError(
      'unauthorized',
      `Clé API refusée (${status}) : vérifie PRIM_API_KEY dans .env.`,
      status,
      error.error,
    );
  }
  if (status === 404) {
    return new PrimApiError(
      'not-found',
      'Ressource introuvable (404) : vérifie le chemin ou l’identifiant demandé.',
      status,
      error.error,
    );
  }
  if (status === 429) {
    return new PrimApiError(
      'quota',
      'Quota dépassé (429) : trop de requêtes, réessaie plus tard.',
      status,
      error.error,
    );
  }
  if (status >= 500) {
    return new PrimApiError(
      'server',
      `Le service PRIM est indisponible (${status}).`,
      status,
      error.error,
    );
  }
  return new PrimApiError('unknown', `Erreur HTTP ${status} ${error.statusText}`.trim(), status, error.error);
}
