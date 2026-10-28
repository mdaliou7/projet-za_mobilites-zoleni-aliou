/** API Calculateur (Navitia) : `/places`. Référence : https://doc.navitia.io */

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
