import { InjectionToken } from '@angular/core';

/** Racine des API PRIM (Prochains passages : `/stop-monitoring`). */
export const PRIM_BASE_URL = 'https://prim.iledefrance-mobilites.fr/marketplace';

/** API Calculateur (Navitia) : `/places`, `/journeys`. */
export const PRIM_NAVITIA_URL = `${PRIM_BASE_URL}/v2/navitia`;

/**
 * API Messages Info Trafic : son « base path » est différent (`/v2/navitia/line_reports`).
 * Appeler ce chemin tout seul renvoie la description de la couverture Navitia, pas le trafic :
 * la ressource se trouve un cran plus loin (`…/line_reports/line_reports`).
 */
export const PRIM_LINE_REPORTS_URL = `${PRIM_NAVITIA_URL}/line_reports`;

/** Jeton d'authentification PRIM, fourni dans `app.config.ts`. */
export const PRIM_API_KEY = new InjectionToken<string>('PRIM_API_KEY');
