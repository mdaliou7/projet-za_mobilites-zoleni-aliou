import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { CarteLieu } from './carte-lieu';

describe('CarteLieu', () => {
  function render(lat = 48.8164, lon = 2.1413, label = 'Château de la Maye (Versailles)') {
    TestBed.configureTestingModule({ imports: [CarteLieu] });
    const fixture = TestBed.createComponent(CarteLieu);
    fixture.componentRef.setInput('lat', lat);
    fixture.componentRef.setInput('lon', lon);
    fixture.componentRef.setInput('label', label);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    return { fixture, root };
  }

  /** Leaflet est chargé à la demande : on attend qu'il ait construit la carte. */
  async function mapReady(root: HTMLElement) {
    await vi.waitFor(() => expect(root.querySelector('.leaflet-marker-icon')).not.toBeNull());
  }

  it('affiche une carte avec un marqueur et la mention OpenStreetMap', async () => {
    const { root } = render();

    await mapReady(root);

    expect(root.querySelector('.leaflet-container')).not.toBeNull();
    expect(root.querySelector('.carte-pin')).not.toBeNull();
    expect(root.querySelector('.leaflet-control-attribution')?.textContent).toContain('OpenStreetMap');
  });

  it("décrit la carte pour les lecteurs d'écran", () => {
    const { root } = render(48.8, 2.1, 'Gare de Meaux (Meaux)');

    expect(root.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('Carte : Gare de Meaux (Meaux)');
  });

  it('affiche le nom du lieu dans une fenêtre sur le marqueur, comme du texte', async () => {
    const { root } = render(48.8, 2.1, '<img src=x onerror=alert(1)> Piège');

    await mapReady(root);
    await vi.waitFor(() => expect(root.querySelector('.leaflet-popup-content')).not.toBeNull());

    const popup = root.querySelector('.leaflet-popup-content') as HTMLElement;
    expect(popup.textContent).toContain('<img src=x onerror=alert(1)> Piège');
    expect(popup.querySelector('img')).toBeNull(); // jamais interprété comme du HTML
  });

  it('déplace le marqueur quand le lieu change', async () => {
    const { fixture, root } = render(48.8164, 2.1413, 'Premier lieu');
    await mapReady(root);

    fixture.componentRef.setInput('lat', 48.9);
    fixture.componentRef.setInput('lon', 2.2);
    fixture.componentRef.setInput('label', 'Second lieu');
    fixture.detectChanges();

    await vi.waitFor(() =>
      expect(root.querySelector('.leaflet-popup-content')?.textContent).toContain('Second lieu'),
    );
  });

  it('se nettoie quand le composant est détruit', async () => {
    const { fixture, root } = render();
    await mapReady(root);

    expect(root.querySelector('.leaflet-map-pane')).not.toBeNull();

    fixture.destroy();

    // Leaflet a retiré tout ce qu'il avait construit dans la carte (fonds, marqueur, contrôles).
    expect(root.querySelector('.leaflet-map-pane')).toBeNull();
  });
});
