import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { JOURNEY_DIRECT, JOURNEY_VERSAILLES_GARE_DU_NORD } from '../../models/itineraire.fixtures';
import { JourneysResponse } from '../../models/itineraire.models';
import { Place } from '../../models/lieux.models';
import { PrimApiError } from '../../models/prim.models';
import { ItineraireApi } from '../../services/itineraire-api';
import { LieuxApi } from '../../services/lieux-api';
import { Itineraire } from './itineraire';

const chatelet: Place = { id: 'stop_area:IDFM:71264', name: 'Châtelet (Paris)', embedded_type: 'stop_area' };
const bercy: Place = { id: 'stop_area:IDFM:71582', name: 'Parc de Bercy (Paris)', embedded_type: 'stop_area' };

const response: JourneysResponse = {
  journeys: [JOURNEY_VERSAILLES_GARE_DU_NORD, JOURNEY_DIRECT],
  context: { car_direct_path: { co2_emission: { value: 4541, unit: 'g CO₂e/passenger' } } },
};

/** URL d'un itinéraire, comme la page la fabrique. */
function url(params: Record<string, string>): string {
  const query = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  return `/itineraire?${query}`;
}

describe('Itineraire', () => {
  async function setup(
    getJourneys: ReturnType<typeof vi.fn<ItineraireApi['getJourneys']>> = vi.fn<ItineraireApi['getJourneys']>(() =>
      of(response),
    ),
    startUrl = '/itineraire',
  ) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'itineraire', component: Itineraire }], withComponentInputBinding()),
        { provide: ItineraireApi, useValue: { getJourneys } },
        { provide: LieuxApi, useValue: { searchPlaces: () => of({ places: [] }) } },
      ],
    });
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(startUrl, Itineraire);
    harness.detectChanges();
    const root = harness.routeNativeElement as HTMLElement;
    const form = component['form'];
    return {
      harness,
      component,
      root,
      form,
      getJourneys,
      router: TestBed.inject(Router),
      button: () => root.querySelector('button[type="submit"]') as HTMLButtonElement,
      text: (selector: string) => root.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      cards: () => root.querySelectorAll('app-trajet-detail'),
      async submit() {
        (root.querySelector('button[type="submit"]') as HTMLButtonElement).click();
        await harness.fixture.whenStable();
        harness.detectChanges();
      },
    };
  }

  describe('formulaire', () => {
    it("désactive le bouton et explique pourquoi tant que le départ et l'arrivée manquent", async () => {
      const t = await setup();

      expect(t.button().disabled).toBe(true);
      expect(t.text('.hint')).toContain('Choisis le départ et l’arrivée');
      expect(t.getJourneys).not.toHaveBeenCalled();
    });

    it("active le bouton avec deux lieux différents et refuse deux lieux identiques", async () => {
      const t = await setup();

      t.form.patchValue({ from: chatelet, to: bercy });
      t.harness.detectChanges();
      expect(t.button().disabled).toBe(false);
      expect(t.text('.hint')).toBe('');

      t.form.patchValue({ to: chatelet });
      t.harness.detectChanges();
      expect(t.button().disabled).toBe(true);
      expect(t.text('.hint')).toContain('identiques');
    });

    it("n'affiche la date et l'heure que si l'on ne part pas maintenant", async () => {
      const t = await setup();
      t.form.patchValue({ from: chatelet, to: bercy });
      t.harness.detectChanges();
      expect(t.root.querySelector('input[type="datetime-local"]')).toBeNull();

      t.form.controls.now.setValue(false);
      t.harness.detectChanges();
      expect(t.root.querySelector('input[type="datetime-local"]')).not.toBeNull();
      expect(t.button().disabled).toBe(false);

      t.form.controls.when.setValue('');
      t.harness.detectChanges();
      expect(t.button().disabled).toBe(true);
      expect(t.text('.hint')).toContain('date et l’heure');
    });
  });

  describe('URL partageable', () => {
    it("restaure le formulaire et lance la recherche à partir de l'URL", async () => {
      const t = await setup(
        undefined,
        url({
          from: 'stop_area:IDFM:71264',
          fromLabel: 'Châtelet (Paris)',
          to: '2.3736;48.8443',
          toLabel: 'Gare de Lyon (Paris)',
          datetime: '20261201T080000',
        }),
      );

      expect(t.getJourneys).toHaveBeenCalledTimes(1);
      expect(t.getJourneys).toHaveBeenCalledWith('stop_area:IDFM:71264', '2.3736;48.8443', {
        datetime: '20261201T080000',
      });
      const values = t.form.getRawValue();
      expect(values.from?.name).toBe('Châtelet (Paris)');
      expect(values.to?.id).toBe('2.3736;48.8443');
      expect(values.now).toBe(false);
      expect(values.when).toBe('2026-12-01T08:00');
      // Les champs de lieux affichent le libellé, sans relancer de recherche de lieu.
      const champs = [...t.root.querySelectorAll<HTMLInputElement>('app-lieux-recherche input')];
      expect(champs.map((c) => c.value)).toEqual(['Châtelet (Paris)', 'Gare de Lyon (Paris)']);

      expect(t.text('.results h2')).toBe('2 trajet(s) : Châtelet (Paris) → Gare de Lyon (Paris)');
      expect(t.cards().length).toBe(2);
      expect((t.cards()[0].querySelector('details') as HTMLDetailsElement).open).toBe(true);
      expect((t.cards()[1].querySelector('details') as HTMLDetailsElement).open).toBe(false);
    });

    it("part maintenant quand l'URL ne contient pas d'heure", async () => {
      const t = await setup(undefined, url({ from: 'a', fromLabel: 'A', to: 'b', toLabel: 'B' }));

      expect(t.getJourneys).toHaveBeenCalledWith('a', 'b', { datetime: undefined });
      expect(t.form.controls.now.value).toBe(true);
    });

    it("met l'URL à jour quand on valide le formulaire, ce qui lance la recherche", async () => {
      const t = await setup();
      t.form.patchValue({ from: chatelet, to: bercy });
      t.harness.detectChanges();

      await t.submit();

      expect(decodeURIComponent(t.router.url)).toContain(
        'from=stop_area:IDFM:71264&fromLabel=Châtelet (Paris)&to=stop_area:IDFM:71582&toLabel=Parc de Bercy (Paris)',
      );
      expect(t.router.url).not.toContain('datetime');
      expect(t.getJourneys).toHaveBeenCalledTimes(1);
      expect(t.cards().length).toBe(2);
    });

    it("met la date choisie dans l'URL au format Navitia", async () => {
      const t = await setup();
      t.form.patchValue({ from: chatelet, to: bercy, now: false, when: '2026-12-01T08:30' });
      t.harness.detectChanges();

      await t.submit();

      expect(t.router.url).toContain('datetime=20261201T083000');
      expect(t.getJourneys).toHaveBeenCalledWith('stop_area:IDFM:71264', 'stop_area:IDFM:71582', {
        datetime: '20261201T083000',
      });
    });

    it("relance la recherche quand on valide deux fois la même demande", async () => {
      const t = await setup();
      t.form.patchValue({ from: chatelet, to: bercy });
      t.harness.detectChanges();

      await t.submit();
      await t.submit();

      expect(t.getJourneys).toHaveBeenCalledTimes(2);
    });

    it("annule une recherche encore en cours quand une nouvelle démarre", async () => {
      const lente = new Subject<JourneysResponse>();
      const getJourneys = vi
        .fn<ItineraireApi['getJourneys']>()
        .mockReturnValueOnce(lente as Observable<JourneysResponse>)
        .mockReturnValueOnce(of(response));
      const t = await setup(getJourneys, url({ from: 'a', fromLabel: 'A', to: 'b', toLabel: 'B' }));
      expect(t.text('.state')).toContain('Recherche des trajets');

      await t.harness.navigateByUrl(url({ from: 'c', fromLabel: 'C', to: 'd', toLabel: 'D' }), Itineraire);
      t.harness.detectChanges();
      expect(t.cards().length).toBe(2);

      lente.next({ journeys: [] }); // réponse tardive de la première recherche : ignorée
      t.harness.detectChanges();

      expect(t.cards().length).toBe(2);
      expect(t.text('.results h2')).toContain('C → D');
    });
  });

  describe('résultats', () => {
    const urlOk = url({ from: 'a', fromLabel: 'A', to: 'b', toLabel: 'B' });

    it('indique clairement quand aucun trajet n’existe', async () => {
      const t = await setup(vi.fn<ItineraireApi['getJourneys']>(() => of({ journeys: [] })), urlOk);

      expect(t.text('.state')).toContain('Aucun trajet trouvé');
      expect(t.cards().length).toBe(0);
      expect(t.root.querySelector('.state.error')).toBeNull();
    });

    it("affiche l'erreur dans une alerte", async () => {
      const t = await setup(
        vi.fn<ItineraireApi['getJourneys']>(() =>
          throwError(() => new PrimApiError('server', 'Le service PRIM est indisponible (503).', 503)),
        ),
        urlOk,
      );

      const alerte = t.root.querySelector('.state.error[role="alert"]');
      expect(alerte?.textContent).toContain('Le service PRIM est indisponible (503).');
      expect(t.cards().length).toBe(0);
    });

    it("passe l'empreinte de la voiture aux trajets pour comparer", async () => {
      const t = await setup(undefined, urlOk);

      expect(t.text('app-trajet-detail .co2')).toContain('en voiture : 4,5 kg');
    });
  });
});
