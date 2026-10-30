/** API Calculateur (Navitia) : `/places`. Référence : https://doc.navitia.io */

/** Coordonnées telles que Navitia les renvoie : des **textes** (`"48.8164…"`). */
export interface Coord {
  lat: string;
  lon: string;
}

export interface PlaceDetails {
  coord?: Coord;
}

export interface Place {
  id: string;
  name: string;
  /** `stop_area`, `address`, `poi`, `administrative_region`… */
  embedded_type: string;
  quality?: number;
  /** Détails propres au type : celui qui correspond à `embedded_type` est présent, avec ses coordonnées. */
  stop_area?: PlaceDetails;
  poi?: PlaceDetails;
  address?: PlaceDetails;
  administrative_region?: PlaceDetails;
}

export interface PlacesResponse {
  places?: Place[];
}

/** Un point sur la carte, en degrés. */
export interface LatLon {
  lat: number;
  lon: number;
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

/** L'identifiant d'une adresse est directement `longitude;latitude` (ex. `2.096837;48.7327234`). */
const COORD_ID = /^(-?\d+(?:\.\d+)?);(-?\d+(?:\.\d+)?)$/;

function toLatLon(lat: string | number, lon: string | number): LatLon | null {
  const point = { lat: Number(lat), lon: Number(lon) };
  const valid =
    Number.isFinite(point.lat) && Number.isFinite(point.lon) && Math.abs(point.lat) <= 90 && Math.abs(point.lon) <= 180;
  return valid ? point : null;
}

/**
 * Position d'un lieu, ou `null` si on ne la connaît pas (un lieu restauré depuis l'URL n'a que son
 * identifiant et son nom). Cherche dans les détails du lieu, puis dans l'identifiant d'une adresse.
 */
export function placeCoordinates(place: Place): LatLon | null {
  const coord =
    place.stop_area?.coord ?? place.poi?.coord ?? place.address?.coord ?? place.administrative_region?.coord;
  if (coord) {
    return toLatLon(coord.lat, coord.lon);
  }
  const fromId = COORD_ID.exec(place.id);
  return fromId ? toLatLon(fromId[2], fromId[1]) : null;
}

/** Position au format attendu par `/journeys` pour un départ ou une arrivée : `longitude;latitude`. */
export function toNavitiaCoordinates(point: LatLon): string {
  // 4 décimales ≈ 11 m : assez précis pour un trajet, et on ne diffuse pas une position exacte dans l'URL.
  return `${point.lon.toFixed(4)};${point.lat.toFixed(4)}`;
}
