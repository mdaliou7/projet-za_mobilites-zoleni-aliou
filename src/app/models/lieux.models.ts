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

const PLACE_TYPE_LABELS: Record<string, string> = {
  stop_area: 'Arrêt',
  address: 'Adresse',
  poi: 'Lieu',
  administrative_region: 'Commune',
};

/** Libellé français d'un type de lieu Navitia, pour l'affichage. */
export function placeTypeLabel(embeddedType: string): string {
  return PLACE_TYPE_LABELS[embeddedType] ?? 'Lieu';
}
