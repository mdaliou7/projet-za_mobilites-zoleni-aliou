import { Component, signal } from '@angular/core';
import { LieuxRecherche } from '../../components/lieux-recherche/lieux-recherche';
import { Place, placeTypeLabel } from '../../models/lieux.models';

@Component({
  imports: [LieuxRecherche],
  selector: 'app-lieux',
  styleUrl: './lieux.scss',
  templateUrl: './lieux.html',
})
export class Lieux {
  protected readonly selected = signal<Place | null>(null);
  protected readonly typeLabel = placeTypeLabel;

  protected onPlaceSelected(place: Place): void {
    this.selected.set(place);
  }
}
