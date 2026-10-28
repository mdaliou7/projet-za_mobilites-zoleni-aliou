/**
 * Types minimaux des réponses PRIM : on ne décrit que les champs dont l'appli se sert.
 * Les champs facultatifs sont marqués `?` car les réponses varient selon le type d'objet ou
 * l'arrêt. Référence Navitia : https://doc.navitia.io. À compléter au fil des besoins.
 */

// --- Calculateur (Navitia) : /places ------------------------------------------------------

export interface Place {
  id: string;
  name: string;
  /** `stop_area`, `address`, `poi`, `administrative_region`… */
  embedded_type: string;
  quality?: number;
}

export interface PlacesResponse {
  places?: Place[];
}

// --- Calculateur (Navitia) : /journeys ----------------------------------------------------

export interface JourneySection {
  /** `public_transport`, `street_network`, `transfer`, `waiting`… */
  type: string;
  mode?: string;
  duration: number;
  from?: { name?: string };
  to?: { name?: string };
  display_informations?: {
    commercial_mode?: string;
    label?: string;
    direction?: string;
    color?: string;
  };
}

export interface Journey {
  /** Durée totale en secondes. */
  duration: number;
  /** Format Navitia : AAAAMMJJTHHMMSS. */
  departure_date_time: string;
  arrival_date_time: string;
  nb_transfers: number;
  sections: JourneySection[];
}

export interface JourneysResponse {
  journeys?: Journey[];
}

// --- Calculateur (Navitia) : /line_reports ------------------------------------------------

/** Pagination commune aux réponses Navitia (`start_page` et `count` en paramètres d'appel). */
export interface Pagination {
  total_result: number;
  start_page: number;
  items_per_page: number;
  items_on_page: number;
}

/** Objet touché par une perturbation : une ligne, une zone d'arrêts ou un point d'arrêt. */
export interface PtObject {
  /** Ex. `line:IDFM:C00298`, `stop_area:IDFM:65063`, `stop_point:IDFM:27435`. */
  id: string;
  name: string;
  embedded_type: 'line' | 'stop_area' | 'stop_point' | string;
}

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
   * plupart touchent des arrêts (`stop_area`, `stop_point`). Voir `prim-traffic.ts`.
   */
  disruptions?: Disruption[];
}

// --- Prochains passages (SIRI Lite) : /stop-monitoring ------------------------------------

export interface SiriText {
  value: string;
}

export interface MonitoredStopVisit {
  MonitoredVehicleJourney?: {
    LineRef?: SiriText;
    DestinationName?: SiriText[];
    MonitoredCall?: {
      StopPointName?: SiriText[];
      ExpectedDepartureTime?: string;
      ExpectedArrivalTime?: string;
      DepartureStatus?: string;
    };
  };
}

export interface StopMonitoringResponse {
  Siri?: {
    ServiceDelivery?: {
      StopMonitoringDelivery?: { MonitoredStopVisit?: MonitoredStopVisit[] }[];
    };
  };
}
