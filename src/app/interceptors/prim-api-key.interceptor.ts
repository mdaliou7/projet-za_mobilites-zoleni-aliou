import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { PRIM_API_KEY, PRIM_BASE_URL } from '../config/prim.config';
import { PrimApiError } from '../models/prim.models';
import { PrimUsage } from '../services/prim-usage';

/**
 * Ajoute l'en-tête `apiKey` aux requêtes vers PRIM, et seulement à celles-là : le jeton ne doit
 * jamais partir vers un autre serveur. Sans jeton, on échoue tout de suite avec un message clair
 * plutôt que de consommer du quota pour recevoir un 401.
 */
export const primApiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(PRIM_BASE_URL)) {
    return next(req);
  }

  const apiKey = inject(PRIM_API_KEY);
  if (!apiKey) {
    return throwError(
      () =>
        new PrimApiError(
          'missing-key',
          'Clé API PRIM manquante : renseigne PRIM_API_KEY dans le fichier .env.',
        ),
    );
  }

  inject(PrimUsage).record();
  return next(req.clone({ setHeaders: { apiKey } }));
};
