import { Service } from '@angular/core';
import { Observable } from 'rxjs';
import { LatLon } from '../models/lieux.models';

export type GeolocationErrorKind = 'unsupported' | 'denied' | 'unavailable' | 'timeout';

/** Erreur de localisation, avec un message prêt à afficher. */
export class GeolocationError extends Error {
  constructor(
    readonly kind: GeolocationErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'GeolocationError';
  }
}

const MESSAGES: Record<GeolocationErrorKind, string> = {
  unsupported: 'Ton navigateur ne permet pas de te localiser.',
  denied: 'La localisation est refusée. Autorise-la dans ton navigateur, ou choisis ton départ à la main.',
  unavailable: 'Ta position est introuvable pour le moment. Choisis ton départ à la main.',
  timeout: 'La localisation prend trop de temps. Réessaie, ou choisis ton départ à la main.',
};

/**
 * Position de l'utilisateur, avec son accord : le navigateur affiche lui-même la demande d'autorisation.
 * La position n'est jamais envoyée à un serveur par ce service ; elle sert à remplir le départ d'un itinéraire.
 */
@Service()
export class Geolocalisation {
  /** Émet une seule fois la position actuelle, puis se termine ; erreur de type `GeolocationError` sinon. */
  getCurrentPosition(): Observable<LatLon> {
    return new Observable<LatLon>((subscriber) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        subscriber.error(new GeolocationError('unsupported', MESSAGES.unsupported));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          subscriber.next({ lat: position.coords.latitude, lon: position.coords.longitude });
          subscriber.complete();
        },
        (error) => {
          const kind: GeolocationErrorKind =
            error.code === error.PERMISSION_DENIED ? 'denied' : error.code === error.TIMEOUT ? 'timeout' : 'unavailable';
          subscriber.error(new GeolocationError(kind, MESSAGES[kind]));
        },
        // Pas de GPS précis nécessaire pour choisir un départ ; 10 s au plus pour répondre.
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
      );
    });
  }
}
