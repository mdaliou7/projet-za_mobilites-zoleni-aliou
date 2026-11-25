import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GeolocationError, Geolocalisation } from './geolocalisation';

type Success = (position: { coords: { latitude: number; longitude: number } }) => void;
type Failure = (error: { code: number; PERMISSION_DENIED: number; POSITION_UNAVAILABLE: number; TIMEOUT: number }) => void;

const CODES = { PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 };

describe('Geolocalisation', () => {
  let service: Geolocalisation;

  beforeEach(() => {
    service = TestBed.inject(Geolocalisation);
  });

  afterEach(() => vi.unstubAllGlobals());

  function stubGeolocation(behaviour: (ok: Success, ko: Failure) => void) {
    const getCurrentPosition = vi.fn((ok: Success, ko: Failure, _options?: object) => behaviour(ok, ko));
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });
    return getCurrentPosition;
  }

  function result() {
    const out: { value?: unknown; error?: unknown; completed: boolean } = { completed: false };
    service.getCurrentPosition().subscribe({
      next: (v) => (out.value = v),
      error: (e: unknown) => (out.error = e),
      complete: () => (out.completed = true),
    });
    return out;
  }

  it('renvoie la position, une seule fois', () => {
    stubGeolocation((ok) => ok({ coords: { latitude: 48.8566, longitude: 2.3522 } }));

    const out = result();

    expect(out.value).toEqual({ lat: 48.8566, lon: 2.3522 });
    expect(out.completed).toBe(true);
  });

  it('demande une localisation peu précise, avec une limite de temps', () => {
    const spy = stubGeolocation((ok) => ok({ coords: { latitude: 0, longitude: 0 } }));

    result();

    expect(spy.mock.calls[0][2]).toMatchObject({ enableHighAccuracy: false, timeout: 10_000 });
  });

  it.each([
    [CODES.PERMISSION_DENIED, 'denied', 'refusée'],
    [CODES.POSITION_UNAVAILABLE, 'unavailable', 'introuvable'],
    [CODES.TIMEOUT, 'timeout', 'trop de temps'],
  ])('traduit le code d’erreur %i en erreur « %s »', (code, kind, extrait) => {
    stubGeolocation((_ok, ko) => ko({ code, ...CODES }));

    const out = result();

    expect(out.error).toBeInstanceOf(GeolocationError);
    expect((out.error as GeolocationError).kind).toBe(kind);
    expect((out.error as GeolocationError).message).toContain(extrait);
  });

  it('signale un navigateur sans géolocalisation', () => {
    vi.stubGlobal('navigator', {});

    const out = result();

    expect((out.error as GeolocationError).kind).toBe('unsupported');
  });
});
