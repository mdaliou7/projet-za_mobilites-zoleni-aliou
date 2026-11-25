import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import type { Map as LeafletMap, Marker } from 'leaflet';

type Leaflet = typeof import('leaflet');

/**
 * Fonds de carte OpenStreetMap. La mention « © OpenStreetMap » est obligatoire (elle s'affiche en bas
 * de la carte). Ces serveurs conviennent à un usage léger comme celui de ce projet ; pour un autre
 * style de carte, il suffit de changer cette adresse.
 */
const TILES_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILES_ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

/**
 * Carte d'un lieu : un marqueur et le nom du lieu. La bibliothèque Leaflet est chargée à la demande
 * (au premier affichage), pour ne pas alourdir les pages qui n'ont pas de carte.
 *
 * `ViewEncapsulation.None` : Leaflet crée lui-même ses éléments HTML, hors du contrôle d'Angular, donc
 * des styles « encapsulés » ne s'y appliqueraient pas. Tous les sélecteurs sont préfixés `app-carte-lieu`.
 */
@Component({
  selector: 'app-carte-lieu',
  styleUrl: './carte-lieu.scss',
  templateUrl: './carte-lieu.html',
  encapsulation: ViewEncapsulation.None,
})
export class CarteLieu {
  readonly lat = input.required<number>();
  readonly lon = input.required<number>();
  readonly label = input.required<string>();
  readonly zoom = input(16);

  private readonly container = viewChild.required<ElementRef<HTMLElement>>('carte');

  private leaflet?: Leaflet;
  private map?: LeafletMap;
  private marker?: Marker;
  private destroyed = false;
  /** Vrai quand la carte est créée : les `input()` sont alors reportés sur elle. */
  private readonly ready = signal(false);

  constructor() {
    afterNextRender(() => void this.createMap());

    effect(() => {
      const lat = this.lat();
      const lon = this.lon();
      const label = this.label();
      const zoom = this.zoom();
      if (this.ready()) {
        this.showPlace(lat, lon, label, zoom);
      }
    });

    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.map?.remove();
    });
  }

  private async createMap(): Promise<void> {
    // Version « module ES » de Leaflet (voir src/types/leaflet-esm.d.ts).
    const L: Leaflet = await import('leaflet/dist/leaflet-src.esm.js');
    if (this.destroyed) {
      return;
    }
    this.leaflet = L;

    this.map = L.map(this.container().nativeElement, {
      center: [this.lat(), this.lon()],
      zoom: this.zoom(),
      // La molette fait défiler la page, comme le reste du site ; on zoome avec les boutons + et −.
      scrollWheelZoom: false,
    });
    L.tileLayer(TILES_URL, { maxZoom: 19, attribution: TILES_ATTRIBUTION }).addTo(this.map);
    this.marker = L.marker([this.lat(), this.lon()], {
      // Marqueur dessiné en CSS : pas d'images à charger.
      icon: L.divIcon({ className: 'carte-pin', html: '<span></span>', iconSize: [30, 40], iconAnchor: [15, 40], popupAnchor: [0, -36] }),
      keyboard: false,
    }).addTo(this.map);

    // Affichage immédiat du lieu (sans attendre l'`effect`), puis les changements ultérieurs
    // de lieu passent par l'`effect` ci-dessus.
    this.showPlace(this.lat(), this.lon(), this.label(), this.zoom());
    this.ready.set(true);
  }

  private showPlace(lat: number, lon: number, label: string, zoom: number): void {
    if (!this.map || !this.marker || !this.leaflet) {
      return;
    }
    this.marker.setLatLng([lat, lon]);
    // Le nom du lieu vient d'une API : on le place comme du texte, jamais comme du HTML.
    const name = document.createElement('strong');
    name.textContent = label;
    this.marker.bindPopup(name).openPopup();
    this.map.setView([lat, lon], zoom);
  }
}
