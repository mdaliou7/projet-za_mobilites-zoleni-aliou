/**
 * API Calculateur (Navitia) : `/journeys`. Référence : https://doc.navitia.io
 * Types établis d'après de vraies réponses (2026-10-30). Les heures d'un trajet sont en **heure de
 * Paris** (format AAAAMMJJTHHMMSS) : on les affiche en découpant le texte, sans conversion.
 */

export interface JourneyPlace {
  name?: string;
}

export interface JourneySection {
  /**
   * `street_network` (marche, vélo…), `crow_fly` (marche « à vol d'oiseau » depuis ou vers un arrêt),
   * `public_transport` (une ligne), `transfer` (correspondance à pied) ou `waiting` (attente, sans
   * `from` ni `to`).
   */
  type: 'street_network' | 'crow_fly' | 'public_transport' | 'transfer' | 'waiting' | string;
  /** `walking`, `bike`, `car`… pour `street_network` et `transfer`. */
  mode?: string;
  /** Durée en secondes. */
  duration: number;
  departure_date_time?: string;
  arrival_date_time?: string;
  from?: JourneyPlace;
  to?: JourneyPlace;
  /** Seulement pour `public_transport`. Les couleurs sont en hexadécimal, sans `#`. */
  display_informations?: {
    label?: string;
    code?: string;
    color?: string;
    text_color?: string;
    commercial_mode?: string;
    physical_mode?: string;
    network?: string;
    direction?: string;
  };
}

export interface Co2Emission {
  /** Grammes de CO₂e par voyageur. */
  value: number;
  unit: string;
}

export interface Journey {
  /** Durée totale en secondes. */
  duration: number;
  /** Format Navitia : AAAAMMJJTHHMMSS, heure de Paris. */
  departure_date_time: string;
  arrival_date_time: string;
  requested_date_time?: string;
  nb_transfers: number;
  /** `best`, `rapid`, `less_fallback_walk`… */
  type?: string;
  tags?: string[];
  durations?: { total?: number; walking?: number };
  co2_emission?: Co2Emission;
  sections: JourneySection[];
}

export interface JourneysResponse {
  journeys?: Journey[];
  context?: {
    timezone?: string;
    /** Émission d'un trajet équivalent en voiture, pour comparer. */
    car_direct_path?: { co2_emission?: Co2Emission };
  };
}

export interface JourneyOptions {
  /** Format Navitia : AAAAMMJJTHHMMSS, heure de Paris. Par défaut : maintenant. */
  datetime?: string;
  count?: number;
}

// --- Dates --------------------------------------------------------------------------------

const NAVITIA_DATE_TIME = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/;
const INPUT_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/** `2026-12-01T08:00` (champ `datetime-local`) → `20261201T080000` (Navitia). */
export function toNavitiaDateTime(inputValue: string): string | undefined {
  const m = INPUT_DATE_TIME.exec(inputValue);
  return m ? `${m[1]}${m[2]}${m[3]}T${m[4]}${m[5]}00` : undefined;
}

/** `20261201T080000` (Navitia) → `2026-12-01T08:00` (champ `datetime-local`). */
export function navitiaToInputValue(navitiaDateTime: string): string {
  const m = NAVITIA_DATE_TIME.exec(navitiaDateTime);
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}` : '';
}

/** `20261030T103617` → `10:36`. */
export function formatNavitiaTime(navitiaDateTime: string | undefined): string {
  const m = navitiaDateTime ? NAVITIA_DATE_TIME.exec(navitiaDateTime) : null;
  return m ? `${m[4]}:${m[5]}` : '';
}

/** Date et heure actuelles au format du champ `datetime-local`, arrondies à la minute. */
export function nowAsInputValue(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// --- Affichage ----------------------------------------------------------------------------

/** 4143 → « 1 h 09 min » ; 223 → « 4 min ». Jamais moins d'une minute. */
export function formatDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) {
    return `${minutes} min`;
  }
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`;
}

/** 518 → « 518 g » ; 4541 → « 4,5 kg ». */
export function formatCo2(grams: number): string {
  return grams < 1000 ? `${Math.round(grams)} g` : `${(grams / 1000).toFixed(1).replace('.', ',')} kg`;
}

/** Les étapes en transport en commun d'un trajet (une par ligne empruntée). */
export function publicTransportSections(journey: Journey): JourneySection[] {
  return journey.sections.filter((s) => s.type === 'public_transport');
}
