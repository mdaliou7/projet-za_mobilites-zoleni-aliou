import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CarteLieu } from '../../components/carte-lieu/carte-lieu';
import { LieuxRecherche } from '../../components/lieux-recherche/lieux-recherche';
import { Place, placeCoordinates, placeTypeLabel, toNavitiaCoordinates } from '../../models/lieux.models';
import { Geolocalisation } from '../../services/geolocalisation';

/** Nom affiché dans le champ « Départ » de l'itinéraire quand le départ est la position de l'utilisateur. */
const MY_POSITION_LABEL = 'Ma position';

/**
 * Recherche d'un lieu, puis : le voir sur une carte et y aller. « Y aller depuis ma position » demande
 * la localisation (avec l'accord de l'utilisateur) puis ouvre l'itinéraire, déjà calculé.
 */
@Component({
  imports: [LieuxRecherche, CarteLieu],
  selector: 'app-lieux',
  styleUrl: './lieux.scss',
  templateUrl: './lieux.html',
})
export class Lieux {
  private readonly router = inject(Router);
  private readonly geolocalisation = inject(Geolocalisation);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selected = signal<Place | null>(null);
  /** Position du lieu choisi, `null` si inconnue : dans ce cas, pas de carte. */
  protected readonly point = computed(() => {
    const place = this.selected();
    return place ? placeCoordinates(place) : null;
  });

  protected readonly locating = signal(false);
  protected readonly locationError = signal('');
  protected readonly typeLabel = placeTypeLabel;

  protected onPlaceSelected(place: Place): void {
    this.selected.set(place);
    this.locationError.set('');
  }

  /** Demande la position de l'utilisateur, puis ouvre l'itinéraire de là jusqu'au lieu choisi. */
  protected goHere(): void {
    const place = this.selected();
    if (!place || this.locating()) {
      return;
    }
    this.locating.set(true);
    this.locationError.set('');

    this.geolocalisation
      .getCurrentPosition()
      .pipe(
        finalize(() => this.locating.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (position) =>
          void this.router.navigate(['/itineraire'], {
            queryParams: {
              from: toNavitiaCoordinates(position),
              fromLabel: MY_POSITION_LABEL,
              to: place.id,
              toLabel: place.name,
            },
          }),
        error: (error: unknown) =>
          this.locationError.set(error instanceof Error ? error.message : 'La localisation a échoué.'),
      });
  }

  /** Sans localisation : ouvre l'itinéraire avec l'arrivée remplie, l'utilisateur choisit son départ. */
  protected chooseDeparture(): void {
    const place = this.selected();
    if (place) {
      void this.router.navigate(['/itineraire'], { queryParams: { to: place.id, toLabel: place.name } });
    }
  }
}
