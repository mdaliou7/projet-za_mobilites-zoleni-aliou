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

export interface Disruption {
  id: string;
  status?: string;
  severity?: { name?: string; effect?: string };
  messages?: { text: string; channel?: { name?: string } }[];
}

export interface LineReport {
  line: { id: string; name: string; code?: string; color?: string };
}

export interface LineReportsResponse {
  line_reports?: LineReport[];
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
