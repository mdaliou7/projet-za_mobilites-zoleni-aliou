/** Types communs aux API PRIM. Les types propres à un domaine sont dans `<domaine>.models.ts`. */

/** Pagination commune aux réponses Navitia (`start_page` et `count` en paramètres d'appel). */
export interface Pagination {
  total_result: number;
  start_page: number;
  items_per_page: number;
  items_on_page: number;
}

/** Objet du réseau : une ligne, une zone d'arrêts ou un point d'arrêt. */
export interface PtObject {
  /** Ex. `line:IDFM:C00298`, `stop_area:IDFM:65063`, `stop_point:IDFM:27435`. */
  id: string;
  name: string;
  embedded_type: 'line' | 'stop_area' | 'stop_point' | string;
}

export type PrimErrorKind =
  | 'missing-key'
  | 'network'
  | 'unauthorized'
  | 'not-found'
  | 'quota'
  | 'server'
  | 'unknown';

/**
 * Erreur unique renvoyée par les services d'API, quelle que soit la cause. Les composants
 * affichent `message` sans connaître HTTP ; `kind` permet d'adapter l'affichage.
 */
export class PrimApiError extends Error {
  constructor(
    readonly kind: PrimErrorKind,
    message: string,
    readonly status?: number,
    /** Corps de la réponse d'erreur, quand le serveur en a envoyé un. */
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'PrimApiError';
  }
}
