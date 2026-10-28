/**
 * API Messages Info Trafic (Navitia) : `/line_reports/line_reports`.
 * Types établis d'après de vraies réponses (2026-10-28). Les helpers en bas de fichier lisent
 * les perturbations sans que les composants connaissent la forme exacte des messages.
 */
import { Pagination, PtObject } from './prim.models';

export interface DisruptionMessage {
  /** HTML pour le canal `moteur` : à afficher via `[innerHTML]` (Angular le nettoie). */
  text: string;
  /** Canaux vus : `titre`, `moteur`, `cbiv`, `notification`, `email ascenseur`, `sms ascenseurs`… */
  channel?: { name?: string; types?: string[] };
}

export interface Disruption {
  id: string;
  /** `active`, `future` ou `past`. */
  status: 'active' | 'future' | 'past' | string;
  severity?: {
    /** Ex. `bloquante`, `perturbée`. */
    name?: string;
    /** `NO_SERVICE`, `SIGNIFICANT_DELAYS`, `OTHER_EFFECT`… */
    effect?: string;
    color?: string;
    priority?: number;
  };
  /** Ex. `Incidents`. */
  category?: string;
  /** Ex. `perturbation`, `travaux`. */
  cause?: string;
  /** Dates au format Navitia AAAAMMJJTHHMMSS (heure de Paris). */
  application_periods?: { begin: string; end: string }[];
  messages?: DisruptionMessage[];
  impacted_objects?: { pt_object: PtObject }[];
}

export interface LineReport {
  line: {
    id: string;
    name: string;
    code?: string;
    color?: string;
    text_color?: string;
    commercial_mode?: { name?: string };
    /** Ex. `physical_mode:Metro` : sert aussi à filtrer (`physicalMode`). */
    physical_modes?: { id: string; name?: string }[];
    network?: { name?: string };
  };
  pt_objects?: PtObject[];
}

export interface LineReportsResponse {
  pagination?: Pagination;
  line_reports?: LineReport[];
  /**
   * Toutes les perturbations de la page, **pas seulement celles des lignes listées** : la
   * plupart touchent des arrêts (`stop_area`, `stop_point`).
   */
  disruptions?: Disruption[];
}

export interface TrafficOptions {
  /** Nombre de lignes par page (max 100). Défaut : 5. */
  count?: number;
  startPage?: number;
  /** Mode de transport, ex. `physical_mode:Metro` (identifiant confirmé par la doc PRIM). */
  physicalMode?: string;
  /** Une ligne précise, ex. `line:IDFM:C01727` (RER C). */
  lineId?: string;
  /** Modes à exclure, ex. `['physical_mode:Bus']`. */
  excludeModes?: string[];
}

// --- Helpers de lecture -------------------------------------------------------------------

/** Titre court d'une perturbation (canal `titre`), ex. « Panne d'un ascenseur ». */
export function disruptionTitle(disruption: Disruption): string | undefined {
  return disruption.messages?.find((m) => m.channel?.name === 'titre')?.text;
}

/** Message détaillé (canal `moteur`) : du HTML, à afficher avec `[innerHTML]`. */
export function disruptionBody(disruption: Disruption): string | undefined {
  return disruption.messages?.find((m) => m.channel?.name === 'moteur')?.text;
}

/**
 * Une panne d'ascenseur est une perturbation comme les autres, mais elle porte des canaux
 * `email ascenseur` / `sms ascenseurs` (constaté sur les réponses réelles du 2026-10-28).
 * Elle touche une zone d'arrêts (`stop_area`) : base du trajet accessible.
 */
export function isElevatorOutage(disruption: Disruption): boolean {
  return (disruption.messages ?? []).some((m) => /ascenseur/i.test(m.channel?.name ?? ''));
}

/** Identifiants des zones d'arrêts touchées par une perturbation (`stop_area:IDFM:65063`…). */
export function impactedStopAreaIds(disruption: Disruption): string[] {
  return (disruption.impacted_objects ?? [])
    .map((o) => o.pt_object)
    .filter((p) => p.embedded_type === 'stop_area')
    .map((p) => p.id);
}
