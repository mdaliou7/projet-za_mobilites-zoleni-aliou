import { Journey } from './itineraire.models';

/**
 * Trajet réel (réduit) renvoyé par PRIM le 2026-10-30 : Versailles → Gare du Nord, avec bus,
 * Transilien L, RER E, une correspondance, deux attentes et de la marche. Sert de données de test.
 */
export const JOURNEY_VERSAILLES_GARE_DU_NORD: Journey = {
  duration: 4143,
  departure_date_time: '20261030T103617',
  arrival_date_time: '20261030T114520',
  requested_date_time: '20261030T103535',
  nb_transfers: 2,
  type: 'best',
  durations: { total: 4143, walking: 872 },
  co2_emission: { value: 517.98, unit: 'g CO₂e/passenger' },
  sections: [
    {
      type: 'street_network',
      mode: 'walking',
      duration: 223,
      from: { name: '9BIS Rue Montbauron (Versailles)' },
      to: { name: 'Lycée Hoche (Versailles)' },
      departure_date_time: '20261030T103617',
      arrival_date_time: '20261030T104000',
    },
    {
      type: 'public_transport',
      duration: 720,
      from: { name: 'Lycée Hoche (Versailles)' },
      to: { name: 'Domaine de la Marche (Marnes-la-Coquette)' },
      departure_date_time: '20261030T104000',
      arrival_date_time: '20261030T105200',
      display_informations: {
        label: '6210',
        code: '6210',
        color: 'FFBE00',
        text_color: '000000',
        commercial_mode: 'Bus',
        physical_mode: 'Bus',
        network: 'Grand Versailles',
        direction: 'Gare de Vaucresson (Vaucresson)',
      },
    },
    {
      type: 'transfer',
      mode: 'walking',
      duration: 309,
      from: { name: 'Domaine de la Marche (Marnes-la-Coquette)' },
      to: { name: 'Vaucresson (Vaucresson)' },
      departure_date_time: '20261030T105200',
      arrival_date_time: '20261030T105709',
    },
    { type: 'waiting', duration: 501, departure_date_time: '20261030T105709', arrival_date_time: '20261030T110530' },
    {
      type: 'public_transport',
      duration: 890,
      from: { name: 'Vaucresson (Vaucresson)' },
      to: { name: 'La Défense (Puteaux)' },
      departure_date_time: '20261030T110530',
      arrival_date_time: '20261030T112020',
      display_informations: {
        label: 'L',
        code: 'L',
        color: 'C4A4CC',
        text_color: '000000',
        commercial_mode: 'Train Transilien',
        physical_mode: 'Train Transilien',
        network: 'Transilien',
        direction: 'Gare Saint-Lazare (Paris)',
      },
    },
    { type: 'waiting', duration: 540, departure_date_time: '20261030T112020', arrival_date_time: '20261030T112920' },
    {
      type: 'public_transport',
      duration: 620,
      from: { name: 'La Défense (Puteaux)' },
      to: { name: 'Magenta (Paris)' },
      departure_date_time: '20261030T112920',
      arrival_date_time: '20261030T113940',
      display_informations: {
        label: 'E',
        code: 'E',
        color: 'B94E9A',
        text_color: 'FFFFFF',
        commercial_mode: 'RER',
        physical_mode: 'RER',
        network: 'RER',
        direction: 'Villiers-sur-Marne - Le Plessis-Trévise (Villiers-sur-Marne)',
      },
    },
    {
      type: 'street_network',
      mode: 'walking',
      duration: 340,
      from: { name: 'Magenta (Paris)' },
      to: { name: '6 Place Napoléon III (Paris)' },
      departure_date_time: '20261030T113940',
      arrival_date_time: '20261030T114520',
    },
  ],
};

/**
 * Trajet entre deux arrêts (Versailles Château Rive Gauche → Gare du Nord) : les étapes de début et de
 * fin sont de type `crow_fly`, avec le même lieu au départ et à l'arrivée. Structure relevée sur une
 * réponse réelle du 2026-10-30 ; les couleurs des lignes sont indicatives.
 */
export const JOURNEY_BETWEEN_STOPS: Journey = {
  duration: 2940,
  departure_date_time: '20261030T105500',
  arrival_date_time: '20261030T114400',
  nb_transfers: 1,
  co2_emission: { value: 131, unit: 'g CO₂e/passenger' },
  sections: [
    {
      type: 'crow_fly',
      mode: 'walking',
      duration: 60,
      from: { name: 'Versailles Château Rive Gauche (Versailles)' },
      to: { name: 'Versailles Château Rive Gauche (Versailles)' },
      departure_date_time: '20261030T105500',
      arrival_date_time: '20261030T105600',
    },
    {
      type: 'public_transport',
      duration: 2100,
      from: { name: 'Versailles Château Rive Gauche (Versailles)' },
      to: { name: 'Saint-Michel Notre-Dame (Paris)' },
      departure_date_time: '20261030T105500',
      arrival_date_time: '20261030T113000',
      display_informations: { label: 'C', color: 'FFCD00', text_color: '000000', commercial_mode: 'RER', direction: 'Juvisy (Juvisy-sur-Orge)' },
    },
    { type: 'waiting', duration: 480, departure_date_time: '20261030T113000', arrival_date_time: '20261030T113800' },
    {
      type: 'public_transport',
      duration: 300,
      from: { name: 'Saint-Michel Notre-Dame (Paris)' },
      to: { name: 'Gare du Nord (Paris)' },
      departure_date_time: '20261030T113900',
      arrival_date_time: '20261030T114400',
      display_informations: { label: 'B', color: '5291CE', text_color: 'FFFFFF', commercial_mode: 'RER', direction: 'Mitry - Claye (Mitry-Mory)' },
    },
    {
      type: 'crow_fly',
      mode: 'walking',
      duration: 60,
      from: { name: 'Gare du Nord (Paris)' },
      to: { name: 'Gare du Nord (Paris)' },
      departure_date_time: '20261030T114400',
      arrival_date_time: '20261030T114500',
    },
  ],
};

/** Trajet direct à pied et en métro, sans correspondance ni CO₂ renseigné. */
export const JOURNEY_DIRECT: Journey = {
  duration: 420,
  departure_date_time: '20261030T090000',
  arrival_date_time: '20261030T090700',
  nb_transfers: 0,
  sections: [
    {
      type: 'public_transport',
      duration: 420,
      from: { name: 'Châtelet' },
      to: { name: 'Gare de Lyon' },
      departure_date_time: '20261030T090000',
      arrival_date_time: '20261030T090700',
      display_informations: { label: '14', color: '662483', text_color: 'FFFFFF', direction: 'Olympiades' },
    },
  ],
};
