import { disruptionBody, disruptionTitle, impactedStopAreaIds, isElevatorOutage } from './prim-traffic';
import { Disruption } from './prim.models';

// Forme réduite d'une vraie perturbation « ascenseur » reçue de PRIM (2026-10-28).
const panneAscenseur: Disruption = {
  id: 'd1',
  status: 'active',
  messages: [
    { text: "Panne d'un ascenseur", channel: { name: 'titre', types: ['title'] } },
    { text: 'GARE D’ARGENTEUIL Panne de l’ascenseur', channel: { name: 'email ascenseur' } },
    { text: '<p>GARE D’ARGENTEUIL Panne</p>', channel: { name: 'moteur', types: ['web'] } },
  ],
  impacted_objects: [
    { pt_object: { id: 'stop_area:IDFM:65063', name: 'Argenteuil', embedded_type: 'stop_area' } },
    { pt_object: { id: 'line:IDFM:C00298', name: '6401', embedded_type: 'line' } },
  ],
};

const manifestation: Disruption = {
  id: 'd2',
  status: 'future',
  messages: [{ text: 'Bus 272 : Manifestation', channel: { name: 'titre' } }],
};

describe('prim-traffic', () => {
  it('lit le titre et le corps HTML', () => {
    expect(disruptionTitle(panneAscenseur)).toBe("Panne d'un ascenseur");
    expect(disruptionBody(panneAscenseur)).toContain('<p>');
    expect(disruptionBody(manifestation)).toBeUndefined();
  });

  it("reconnaît une panne d'ascenseur", () => {
    expect(isElevatorOutage(panneAscenseur)).toBe(true);
    expect(isElevatorOutage(manifestation)).toBe(false);
    expect(isElevatorOutage({ id: 'x', status: 'active' })).toBe(false);
  });

  it("ne garde que les zones d'arrêts touchées", () => {
    expect(impactedStopAreaIds(panneAscenseur)).toEqual(['stop_area:IDFM:65063']);
    expect(impactedStopAreaIds(manifestation)).toEqual([]);
  });
});
