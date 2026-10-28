import { InjectionToken } from '@angular/core';

/** Racine des API PRIM (Prochains passages : `/stop-monitoring`). */
export const PRIM_BASE_URL = 'https://prim.iledefrance-mobilites.fr/marketplace';

/** API Calculateur (Navitia) : `/places`, `/journeys`, `/line_reports`. */
export const PRIM_NAVITIA_URL = `${PRIM_BASE_URL}/v2/navitia`;

/** Jeton d'authentification PRIM, fourni dans `app.config.ts`. */
export const PRIM_API_KEY = new InjectionToken<string>('PRIM_API_KEY');
