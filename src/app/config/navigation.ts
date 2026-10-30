export interface NavLink {
  /** Chemin de la route, sans `/` initial. */
  path: string;
  label: string;
  /** Phrase affichée sur la carte de la page d'accueil. */
  description: string;
  /** Tracé SVG (viewBox 24×24) affiché dans la barre d'onglets mobile. */
  icon: string;
}

/** Liens de navigation partagés par l'en-tête (écran large), la barre d'onglets (mobile) et l'accueil. */
export const NAV_LINKS: readonly NavLink[] = [
  {
    path: 'lieux',
    label: 'Lieux',
    description: 'Cherche une adresse, un arrêt ou une gare.',
    icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z',
  },
  {
    path: 'itineraire',
    label: 'Itinéraire',
    description: 'Calcule ton trajet en transports en commun.',
    icon: 'M21.71 11.29l-9-9a.996.996 0 0 0-1.41 0l-9 9a.996.996 0 0 0 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9a.996.996 0 0 0 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z',
  },
  {
    path: 'horaires',
    label: 'Horaires',
    description: 'Les prochains passages à un arrêt, en temps réel.',
    icon: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
  },
  {
    path: 'trafic',
    label: 'Trafic',
    description: 'Les perturbations en cours sur le réseau.',
    icon: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
  },
  {
    path: 'favoris',
    label: 'Favoris',
    description: 'Retrouve tes lieux et arrêts enregistrés.',
    icon: 'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  },
];
