import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LatLon, Place } from '../../models/lieux.models';
import { GeolocationError, Geolocalisation } from '../../services/geolocalisation';
import { LieuxApi } from '../../services/lieux-api';
import { Lieux } from './lieux';

const arret: Place = {
  id: 'stop_area:IDFM:71264',
  name: 'Châtelet (Paris)',
  embedded_type: 'stop_area',
  stop_area: { coord: { lat: '48.8584', lon: '2.3470' } },
};
// Un lieu dont on ne connaît pas la position (ni détails, ni identifiant « longitude;latitude »).
const sansPosition: Place = { id: 'stop_area:IDFM:99999', name: 'Quelque part', embedded_type: 'stop_area' };

describe('Lieux', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup(
    options: { place?: Place; position?: () => Observable<LatLon> } = {},
  ) {
    const place = options.place ?? arret;
    const getCurrentPosition = vi.fn(options.position ?? (() => of({ lat: 48.8566, lon: 2.3522 })));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: LieuxApi, useValue: { searchPlaces: () => of({ places: [place] }) } },
        { provide: Geolocalisation, useValue: { getCurrentPosition } },
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Lieux);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    /** Tape dans le champ puis choisit la première suggestion, comme un utilisateur. */
    function chooseFirstSuggestion() {
      const input = root.querySelector('input') as HTMLInputElement;
      input.value = 'chat';
      input.dispatchEvent(new Event('input'));
      vi.advanceTimersByTime(350);
      fixture.detectChanges();
      root
        .querySelector('[role="option"]')
        ?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      fixture.detectChanges();
    }
    const button = (label: string) =>
      [...root.querySelectorAll('button')].find((b) => b.textContent?.includes(label)) as HTMLButtonElement | undefined;

    return { fixture, root, navigate, getCurrentPosition, chooseFirstSuggestion, button };
  }

  it('propose le champ de recherche, sans carte ni boutons tant qu’aucun lieu n’est choisi', () => {
    const t = setup();

    expect(t.root.querySelector('h1')?.textContent).toContain('Lieux');
    expect(t.root.querySelector('app-lieux-recherche input')).toBeTruthy();
    expect(t.root.querySelector('app-carte-lieu')).toBeNull();
    expect(t.button('Y aller')).toBeUndefined();
  });

  it('affiche la fiche du lieu choisi, avec sa carte', () => {
    const t = setup();

    t.chooseFirstSuggestion();

    const fiche = t.root.querySelector('.result');
    expect(fiche?.textContent).toContain('Châtelet (Paris)');
    expect(fiche?.textContent).toContain('Arrêt');
    expect(t.root.querySelector('app-carte-lieu [role="region"]')?.getAttribute('aria-label')).toBe(
      'Carte : Châtelet (Paris)',
    );
    expect(t.button('Y aller depuis ma position')).toBeTruthy();
    expect(t.button('Choisir mon départ')).toBeTruthy();
  });

  it('explique l’absence de carte quand la position du lieu est inconnue', () => {
    const t = setup({ place: sansPosition });

    t.chooseFirstSuggestion();

    expect(t.root.querySelector('app-carte-lieu')).toBeNull();
    expect(t.root.querySelector('.no-map')?.textContent).toContain('position de ce lieu est inconnue');
    expect(t.button('Y aller depuis ma position')).toBeTruthy(); // l'itinéraire reste possible
  });

  describe('« Y aller depuis ma position »', () => {
    it("ouvre l'itinéraire avec la position comme départ et le lieu comme arrivée", () => {
      const t = setup();
      t.chooseFirstSuggestion();

      t.button('Y aller depuis ma position')?.click();

      expect(t.getCurrentPosition).toHaveBeenCalledTimes(1);
      expect(t.navigate).toHaveBeenCalledWith(['/itineraire'], {
        queryParams: {
          from: '2.3522;48.8566', // longitude;latitude, sur 4 décimales
          fromLabel: 'Ma position',
          to: 'stop_area:IDFM:71264',
          toLabel: 'Châtelet (Paris)',
        },
      });
    });

    it('indique que la localisation est en cours et bloque un second clic', () => {
      const position = new Subject<LatLon>();
      const t = setup({ position: () => position });
      t.chooseFirstSuggestion();

      t.button('Y aller depuis ma position')?.click();
      t.fixture.detectChanges();

      const bouton = t.button('Localisation en cours') as HTMLButtonElement;
      expect(bouton.disabled).toBe(true);
      expect(t.root.querySelector('.result .status')?.textContent).toContain('Autorise la localisation');

      bouton.click(); // second clic ignoré
      expect(t.getCurrentPosition).toHaveBeenCalledTimes(1);

      position.next({ lat: 48.85, lon: 2.35 });
      position.complete();
      t.fixture.detectChanges();
      expect(t.navigate).toHaveBeenCalledTimes(1);
      expect(t.button('Y aller depuis ma position')?.disabled).toBe(false);
    });

    it("affiche le message d'erreur et ne change pas de page si la localisation est refusée", () => {
      const t = setup({
        position: () => throwError(() => new GeolocationError('denied', 'La localisation est refusée.')),
      });
      t.chooseFirstSuggestion();

      t.button('Y aller depuis ma position')?.click();
      t.fixture.detectChanges();

      expect(t.root.querySelector('.status.error[role="alert"]')?.textContent).toContain('La localisation est refusée.');
      expect(t.navigate).not.toHaveBeenCalled();
      expect(t.button('Y aller depuis ma position')?.disabled).toBe(false); // on peut réessayer
    });
  });

  it("« Choisir mon départ » ouvre l'itinéraire avec seulement l'arrivée remplie", () => {
    const t = setup();
    t.chooseFirstSuggestion();

    t.button('Choisir mon départ')?.click();

    expect(t.getCurrentPosition).not.toHaveBeenCalled();
    expect(t.navigate).toHaveBeenCalledWith(['/itineraire'], {
      queryParams: { to: 'stop_area:IDFM:71264', toLabel: 'Châtelet (Paris)' },
    });
  });
});
