import { Place, placeCoordinates, placeTypeLabel, toNavitiaCoordinates } from './lieux.models';

// Formes réelles renvoyées par /places le 2026-10-30 (réduites).
const arret: Place = {
  id: 'stop_area:IDFM:64056',
  name: 'Château de la Maye (Versailles)',
  embedded_type: 'stop_area',
  stop_area: { coord: { lat: '48.816479657994336', lon: '2.14134499100806' } },
};
const lieuInteret: Place = {
  id: 'poi:8026',
  name: 'Château de Versailles (Versailles)',
  embedded_type: 'poi',
  poi: { coord: { lat: '48.80486984', lon: '2.121080895' } },
};
const adresse: Place = {
  id: '2.096837;48.7327234',
  name: 'Route de Versailles (Châteaufort)',
  embedded_type: 'address',
  address: { coord: { lat: '48.7327234', lon: '2.096837' } },
};

describe('lieux.models', () => {
  describe('placeTypeLabel', () => {
    it('traduit les types de lieux connus', () => {
      expect(placeTypeLabel('stop_area')).toBe('Arrêt');
      expect(placeTypeLabel('address')).toBe('Adresse');
      expect(placeTypeLabel('poi')).toBe('Lieu');
      expect(placeTypeLabel('administrative_region')).toBe('Commune');
    });

    it('retombe sur « Lieu » pour un type inconnu', () => {
      expect(placeTypeLabel('quelque_chose')).toBe('Lieu');
    });
  });

  describe('placeCoordinates', () => {
    it('lit les coordonnées (des textes) d’un arrêt, d’un lieu d’intérêt et d’une adresse', () => {
      expect(placeCoordinates(arret)).toEqual({ lat: 48.816479657994336, lon: 2.14134499100806 });
      expect(placeCoordinates(lieuInteret)).toEqual({ lat: 48.80486984, lon: 2.121080895 });
      expect(placeCoordinates(adresse)).toEqual({ lat: 48.7327234, lon: 2.096837 });
    });

    it('retrouve la position d’une adresse dans son identifiant « longitude;latitude »', () => {
      const restauree: Place = { id: '2.364828;48.826953', name: '90 Rue de Tolbiac (Paris)', embedded_type: 'place' };

      expect(placeCoordinates(restauree)).toEqual({ lat: 48.826953, lon: 2.364828 });
    });

    it('renvoie null quand la position est inconnue', () => {
      const restaure: Place = { id: 'stop_area:IDFM:71264', name: 'Châtelet (Paris)', embedded_type: 'place' };

      expect(placeCoordinates(restaure)).toBeNull();
    });

    it('refuse des coordonnées absurdes', () => {
      const absurde: Place = {
        id: 'x',
        name: 'X',
        embedded_type: 'poi',
        poi: { coord: { lat: 'pas un nombre', lon: '2.1' } },
      };
      const horsLimites: Place = { id: 'y', name: 'Y', embedded_type: 'poi', poi: { coord: { lat: '120', lon: '2.1' } } };

      expect(placeCoordinates(absurde)).toBeNull();
      expect(placeCoordinates(horsLimites)).toBeNull();
    });
  });

  describe('toNavitiaCoordinates', () => {
    it('met la longitude avant la latitude, sur 4 décimales', () => {
      expect(toNavitiaCoordinates({ lat: 48.826953, lon: 2.364828 })).toBe('2.3648;48.8270');
    });
  });
});
