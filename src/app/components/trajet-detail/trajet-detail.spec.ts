import { TestBed } from '@angular/core/testing';
import { Co2Emission, Journey } from '../../models/itineraire.models';
import {
  JOURNEY_BETWEEN_STOPS,
  JOURNEY_DIRECT,
  JOURNEY_VERSAILLES_GARE_DU_NORD,
} from '../../models/itineraire.fixtures';
import { TrajetDetail } from './trajet-detail';

describe('TrajetDetail', () => {
  function render(journey: Journey, extra: { carCo2?: Co2Emission; open?: boolean } = {}) {
    TestBed.configureTestingModule({ imports: [TrajetDetail] });
    const fixture = TestBed.createComponent(TrajetDetail);
    fixture.componentRef.setInput('journey', journey);
    if (extra.carCo2) {
      fixture.componentRef.setInput('carCo2', extra.carCo2);
    }
    if (extra.open) {
      fixture.componentRef.setInput('open', true);
    }
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const text = (sel: string) => root.querySelector(sel)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    return { root, text };
  }

  it("résume le trajet : heures de Paris, durée, correspondances et lignes", () => {
    const { root, text } = render(JOURNEY_VERSAILLES_GARE_DU_NORD);

    expect(text('.times')).toBe('10:36 → 11:45');
    expect(text('.duration')).toBe('1 h 09 min');
    expect(text('.transfers')).toBe('2 correspondances');
    const badges = [...root.querySelectorAll('summary app-line-badge')].map((b) => b.textContent?.trim());
    expect(badges).toEqual(['6210', 'L', 'E']);
  });

  it('dit « Direct » quand il n’y a aucune correspondance', () => {
    expect(render(JOURNEY_DIRECT).text('.transfers')).toBe('Direct');
  });

  it('détaille chaque étape selon son type', () => {
    const { root, text } = render(JOURNEY_VERSAILLES_GARE_DU_NORD);
    const steps = [...root.querySelectorAll('.step')].map((s) => ({
      type: s.getAttribute('data-type'),
      textContent: s.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    }));

    expect(steps.length).toBe(8);
    expect(steps.map((s) => s.type)).toEqual([
      'street_network',
      'public_transport',
      'transfer',
      'waiting',
      'public_transport',
      'waiting',
      'public_transport',
      'street_network',
    ]);
    expect(steps[0].textContent).toContain('Marcher · 4 min');
    expect(steps[1].textContent).toContain('Bus direction Gare de Vaucresson');
    expect(steps[1].textContent).toContain('10:40 Lycée Hoche (Versailles) → 10:52 Domaine de la Marche');
    expect(steps[2].textContent).toContain('Correspondance à pied · 5 min');
    expect(steps[3].textContent).toContain('Attente · 8 min');
    expect(text('.step:nth-child(7)')).toContain('RER');
    expect(text('.step:nth-child(7)')).toContain('Villiers-sur-Marne');
  });

  it('affiche la marche « à vol d’oiseau » (crow_fly) comme de la marche, sans « de X à X » redondant', () => {
    const { root } = render(JOURNEY_BETWEEN_STOPS);
    const steps = [...root.querySelectorAll('.step')].map((s) => s.textContent?.replace(/\s+/g, ' ').trim() ?? '');

    expect(steps.length).toBe(5);
    expect(steps[0]).toContain('Marcher · 1 min');
    expect(steps[4]).toContain('Marcher · 1 min');
    expect(steps.join(' ')).not.toContain('undefined');
    expect(steps[0]).not.toContain('de  à');
    expect(root.querySelectorAll('.step .detail').length).toBe(2); // seulement les deux étapes en RER
  });

  it("affiche l'empreinte carbone, avec la voiture pour comparer", () => {
    const { text } = render(JOURNEY_VERSAILLES_GARE_DU_NORD, {
      carCo2: { value: 4541, unit: 'g CO₂e/passenger' },
    });

    expect(text('.co2')).toContain('518 g');
    expect(text('.co2')).toContain('en voiture : 4,5 kg');
  });

  it("n'affiche pas d'empreinte carbone quand l'API n'en donne pas", () => {
    expect(render(JOURNEY_DIRECT).root.querySelector('.co2')).toBeNull();
  });

  it('peut être déplié au départ', () => {
    const replie = render(JOURNEY_DIRECT).root.querySelector('details') as HTMLDetailsElement;
    expect(replie.open).toBe(false);

    TestBed.resetTestingModule();
    const deplie = render(JOURNEY_DIRECT, { open: true }).root.querySelector('details') as HTMLDetailsElement;
    expect(deplie.open).toBe(true);
  });
});
