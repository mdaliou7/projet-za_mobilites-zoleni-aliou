import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Place, PlacesResponse } from '../../models/lieux.models';
import { PrimApiError } from '../../models/prim.models';
import { LieuxApi } from '../../services/lieux-api';
import { LieuxRecherche } from './lieux-recherche';

const chatelet: Place = { id: 'stop_area:IDFM:71264', name: 'Châtelet (Paris)', embedded_type: 'stop_area' };
const rue: Place = { id: 'address:2.34;48.85', name: '1 Rue de Rivoli (Paris)', embedded_type: 'address' };

describe('LieuxRecherche', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup(search: (q: string) => Observable<PlacesResponse>) {
    const searchPlaces = vi.fn(search);
    TestBed.configureTestingModule({
      imports: [LieuxRecherche],
      providers: [{ provide: LieuxApi, useValue: { searchPlaces } }],
    });
    const fixture = TestBed.createComponent(LieuxRecherche);
    fixture.componentRef.setInput('label', 'Départ');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;
    const chosen: Place[] = [];
    fixture.componentInstance.placeSelected.subscribe((p) => chosen.push(p));

    return {
      root,
      input,
      searchPlaces,
      chosen,
      options: () => [...root.querySelectorAll<HTMLElement>('[role="option"]')],
      status: () => root.querySelector('.status')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      type(value: string) {
        input.value = value;
        input.dispatchEvent(new Event('input'));
      },
      press(key: string) {
        input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
        fixture.detectChanges();
      },
      wait(ms: number) {
        vi.advanceTimersByTime(ms);
        fixture.detectChanges();
      },
    };
  }

  it("n'appelle pas l'API sous 3 caractères", () => {
    const t = setup(() => of({ places: [chatelet] }));

    t.type('ch');
    t.wait(1000);

    expect(t.searchPlaces).not.toHaveBeenCalled();
    expect(t.status()).toContain('Tape au moins 3 caractères');
  });

  it('attend la fin de la frappe avant de chercher', () => {
    const t = setup(() => of({ places: [chatelet] }));

    t.type('cha');
    t.wait(100);
    t.type('chat');
    t.wait(100);
    t.type('chatelet');
    t.wait(349);
    expect(t.searchPlaces).not.toHaveBeenCalled();

    t.wait(1);
    expect(t.searchPlaces).toHaveBeenCalledTimes(1);
    expect(t.searchPlaces).toHaveBeenCalledWith('chatelet');
  });

  it('ignore les espaces autour de la saisie', () => {
    const t = setup(() => of({ places: [chatelet] }));

    t.type('  chatelet  ');
    t.wait(350);

    expect(t.searchPlaces).toHaveBeenCalledWith('chatelet');
  });

  it('affiche les suggestions avec leur type', () => {
    const t = setup(() => of({ places: [chatelet, rue] }));

    t.type('chat');
    t.wait(350);

    const options = t.options();
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('Châtelet (Paris)');
    expect(options[0].textContent).toContain('Arrêt');
    expect(options[1].textContent).toContain('Adresse');
    expect(t.input.getAttribute('aria-expanded')).toBe('true');
  });

  it('émet le lieu choisi à la souris et remplit le champ sans relancer de recherche', () => {
    const t = setup(() => of({ places: [chatelet, rue] }));
    t.type('chat');
    t.wait(350);

    t.options()[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    t.wait(1000);

    expect(t.chosen).toEqual([chatelet]);
    expect(t.input.value).toBe('Châtelet (Paris)');
    expect(t.options().length).toBe(0);
    expect(t.searchPlaces).toHaveBeenCalledTimes(1);
  });

  it('se commande au clavier : flèches, Entrée et Échap', () => {
    const t = setup(() => of({ places: [chatelet, rue] }));
    t.type('chat');
    t.wait(350);

    t.press('ArrowDown');
    expect(t.input.getAttribute('aria-activedescendant')).toBe(t.options()[0].id);
    t.press('ArrowDown');
    expect(t.input.getAttribute('aria-activedescendant')).toBe(t.options()[1].id);
    t.press('ArrowDown'); // revient au début
    expect(t.input.getAttribute('aria-activedescendant')).toBe(t.options()[0].id);
    t.press('ArrowUp'); // et boucle vers la fin
    expect(t.input.getAttribute('aria-activedescendant')).toBe(t.options()[1].id);

    t.press('Enter');
    expect(t.chosen).toEqual([rue]);
    expect(t.options().length).toBe(0);
  });

  it('referme la liste avec Échap', () => {
    const t = setup(() => of({ places: [chatelet] }));
    t.type('chat');
    t.wait(350);
    expect(t.options().length).toBe(1);

    t.press('Escape');

    expect(t.options().length).toBe(0);
    expect(t.input.getAttribute('aria-expanded')).toBe('false');
  });

  it("n'émet rien sur Entrée quand aucune suggestion n'est active", () => {
    const t = setup(() => of({ places: [chatelet] }));
    t.type('chat');
    t.wait(350);

    t.press('Enter');

    expect(t.chosen).toEqual([]);
  });

  it('signale quand aucun lieu ne correspond', () => {
    const t = setup(() => of({ places: [] }));

    t.type('zzzz');
    t.wait(350);

    expect(t.status()).toContain('Aucun lieu trouvé pour « zzzz »');
    expect(t.options().length).toBe(0);
  });

  it("affiche le message de l'erreur et continue de fonctionner ensuite", () => {
    let appels = 0;
    const t = setup(() => {
      appels++;
      return appels === 1
        ? throwError(() => new PrimApiError('quota', 'Quota dépassé (429) : réessaie plus tard.', 429))
        : of({ places: [chatelet] });
    });

    t.type('chat');
    t.wait(350);
    expect(t.status()).toContain('Quota dépassé (429)');
    expect(t.options().length).toBe(0);

    t.type('chate');
    t.wait(350);
    expect(t.searchPlaces).toHaveBeenCalledTimes(2);
    expect(t.options().length).toBe(1);
  });

  it("n'affiche pas la réponse d'une recherche périmée", () => {
    const reponse = new Subject<PlacesResponse>();
    const t = setup(() => reponse);

    t.type('cha');
    t.wait(350);
    expect(t.status()).toContain('Recherche en cours');

    // La saisie est effacée avant la réponse : celle-ci ne doit plus s'afficher.
    t.type('ch');
    t.wait(350);
    reponse.next({ places: [chatelet] });
    t.wait(0);

    expect(t.options().length).toBe(0);
    expect(t.status()).toContain('Tape au moins 3 caractères');
  });
});
