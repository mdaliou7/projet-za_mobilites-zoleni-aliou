/** API Calculateur (Navitia) : `/journeys`. Référence : https://doc.navitia.io */

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

export interface JourneyOptions {
  /** Format Navitia : AAAAMMJJTHHMMSS. Par défaut : maintenant. */
  datetime?: string;
  count?: number;
}
