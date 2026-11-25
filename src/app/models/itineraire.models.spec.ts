import {
  Journey,
  formatCo2,
  formatDuration,
  formatNavitiaTime,
  navitiaToInputValue,
  nowAsInputValue,
  publicTransportSections,
  toNavitiaDateTime,
} from './itineraire.models';

describe('itineraire.models', () => {
  describe('dates', () => {
    it('convertit un champ datetime-local en date Navitia', () => {
      expect(toNavitiaDateTime('2026-12-01T08:00')).toBe('20261201T080000');
      expect(toNavitiaDateTime('2026-12-01T08:05:30')).toBe('20261201T080500');
    });

    it('refuse une valeur mal formée', () => {
      expect(toNavitiaDateTime('')).toBeUndefined();
      expect(toNavitiaDateTime('demain matin')).toBeUndefined();
    });

    it('fait le chemin inverse', () => {
      expect(navitiaToInputValue('20261201T080000')).toBe('2026-12-01T08:00');
      expect(navitiaToInputValue('n’importe quoi')).toBe('');
    });

    it("garde l'heure telle quelle, sans décalage de fuseau", () => {
      expect(formatNavitiaTime('20261030T103617')).toBe('10:36');
      expect(formatNavitiaTime('20261030T000500')).toBe('00:05');
      expect(formatNavitiaTime(undefined)).toBe('');
      expect(formatNavitiaTime('xx')).toBe('');
    });

    it("formate l'heure actuelle pour le champ datetime-local", () => {
      expect(nowAsInputValue(new Date(2026, 11, 1, 8, 5))).toBe('2026-12-01T08:05');
      expect(nowAsInputValue(new Date(2026, 0, 9, 23, 59))).toBe('2026-01-09T23:59');
    });
  });

  describe('affichage', () => {
    it('formate les durées', () => {
      expect(formatDuration(4143)).toBe('1 h 09 min');
      expect(formatDuration(3600)).toBe('1 h 00 min');
      expect(formatDuration(420)).toBe('7 min');
      expect(formatDuration(223)).toBe('4 min');
      expect(formatDuration(10)).toBe('1 min');
    });

    it('formate le CO₂ en grammes puis en kilos', () => {
      expect(formatCo2(517.98)).toBe('518 g');
      expect(formatCo2(999.4)).toBe('999 g');
      expect(formatCo2(4541)).toBe('4,5 kg');
    });

    it('ne garde que les étapes en transport en commun', () => {
      const journey: Journey = {
        duration: 100,
        departure_date_time: '20261030T100000',
        arrival_date_time: '20261030T101000',
        nb_transfers: 0,
        sections: [
          { type: 'street_network', duration: 10 },
          { type: 'public_transport', duration: 60, display_informations: { label: 'E' } },
          { type: 'waiting', duration: 5 },
          { type: 'public_transport', duration: 20, display_informations: { label: '14' } },
        ],
      };

      expect(publicTransportSections(journey).map((s) => s.display_informations?.label)).toEqual(['E', '14']);
    });
  });
});
