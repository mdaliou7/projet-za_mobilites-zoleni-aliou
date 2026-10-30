import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LieuxApi } from '../../services/lieux-api';
import { Lieux } from './lieux';

describe('Lieux', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [Lieux],
      providers: [
        {
          provide: LieuxApi,
          useValue: {
            searchPlaces: () =>
              of({ places: [{ id: 'stop_area:IDFM:71264', name: 'Châtelet (Paris)', embedded_type: 'stop_area' }] }),
          },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => vi.useRealTimers());

  it('propose le champ de recherche', () => {
    const fixture = TestBed.createComponent(Lieux);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent).toContain('Lieux');
    expect(root.querySelector('app-lieux-recherche input')).toBeTruthy();
  });

  it('affiche le lieu choisi parmi les suggestions', () => {
    const fixture = TestBed.createComponent(Lieux);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.result')).toBeNull();

    const input = root.querySelector('input') as HTMLInputElement;
    input.value = 'chatelet';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(350);
    fixture.detectChanges();

    root
      .querySelector('[role="option"]')
      ?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const result = root.querySelector('.result');
    expect(result?.textContent).toContain('Châtelet (Paris)');
    expect(result?.textContent).toContain('Arrêt');
    expect(result?.textContent).toContain('stop_area:IDFM:71264');
  });
});
