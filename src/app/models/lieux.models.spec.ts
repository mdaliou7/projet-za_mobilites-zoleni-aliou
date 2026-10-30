import { placeTypeLabel } from './lieux.models';

describe('lieux.models', () => {
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
