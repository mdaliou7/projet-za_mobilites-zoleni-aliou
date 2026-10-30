import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, catchError, map, of, switchMap, tap } from 'rxjs';
import { LieuxRecherche } from '../../components/lieux-recherche/lieux-recherche';
import { TrajetDetail } from '../../components/trajet-detail/trajet-detail';
import {
  Co2Emission,
  Journey,
  JourneysResponse,
  navitiaToInputValue,
  nowAsInputValue,
  toNavitiaDateTime,
} from '../../models/itineraire.models';
import { Place } from '../../models/lieux.models';
import { ItineraireApi } from '../../services/itineraire-api';

interface SearchRequest {
  from: string;
  fromLabel: string;
  to: string;
  toLabel: string;
  /** Format Navitia ; absent = « maintenant ». */
  datetime?: string;
}

type SearchStatus = 'idle' | 'loading' | 'done' | 'error';
type SearchOutcome = { request: SearchRequest; response: JourneysResponse } | { request: SearchRequest; error: unknown };

/** Le départ et l'arrivée doivent être deux lieux différents. */
function differentPlaces(group: AbstractControl): ValidationErrors | null {
  const from = group.get('from')?.value as Place | null;
  const to = group.get('to')?.value as Place | null;
  return from && to && from.id === to.id ? { samePlace: true } : null;
}

/** Si l'on ne part pas maintenant, une date et une heure valides sont nécessaires. */
function whenRequired(group: AbstractControl): ValidationErrors | null {
  const now = group.get('now')?.value as boolean;
  const when = group.get('when')?.value as string;
  return !now && !toNavitiaDateTime(when) ? { missingWhen: true } : null;
}

/** Reconstruit un lieu à partir de l'URL, où seuls l'identifiant et le libellé sont conservés. */
function placeFromUrl(id: string, label: string | undefined): Place {
  return { id, name: label || id, embedded_type: 'place' };
}

/**
 * Calcul d'itinéraire. Le formulaire ne lance pas la recherche lui-même : il met à jour l'URL
 * (`?from=…&to=…&datetime=…`), et c'est l'URL qui déclenche la recherche. Ainsi un trajet se
 * partage par lien et le bouton « précédent » du navigateur fonctionne.
 */
@Component({
  imports: [ReactiveFormsModule, LieuxRecherche, TrajetDetail],
  selector: 'app-itineraire',
  styleUrl: './itineraire.scss',
  templateUrl: './itineraire.html',
})
export class Itineraire {
  // Paramètres de l'URL, liés par `withComponentInputBinding()`.
  readonly from = input<string>();
  readonly fromLabel = input<string>();
  readonly to = input<string>();
  readonly toLabel = input<string>();
  readonly datetime = input<string>();

  private readonly api = inject(ItineraireApi);
  private readonly router = inject(Router);
  private readonly requests = new Subject<SearchRequest>();

  protected readonly form = new FormGroup(
    {
      from: new FormControl<Place | null>(null, Validators.required),
      to: new FormControl<Place | null>(null, Validators.required),
      now: new FormControl(true, { nonNullable: true }),
      when: new FormControl(nowAsInputValue(), { nonNullable: true }),
    },
    { validators: [differentPlaces, whenRequired] },
  );

  /**
   * Un `FormGroup` n'est pas un signal : sans ceci, l'écran ne se met à jour que si zone.js déclenche un
   * rafraîchissement. Chaque changement du formulaire met ce signal à jour, et tout ce qui est calculé
   * à partir de lui (ci-dessous) se rafraîchit de façon fiable.
   */
  private readonly formChanged = toSignal(this.form.valueChanges, { initialValue: null });

  protected readonly fromPlace = computed(() => {
    this.formChanged();
    return this.form.controls.from.value;
  });
  protected readonly toPlace = computed(() => {
    this.formChanged();
    return this.form.controls.to.value;
  });
  protected readonly leavingNow = computed(() => {
    this.formChanged();
    return this.form.controls.now.value;
  });

  protected readonly status = signal<SearchStatus>('idle');

  protected readonly canSubmit = computed(() => {
    this.formChanged();
    return this.form.valid && this.status() !== 'loading';
  });

  /** Message sous le formulaire pour expliquer pourquoi le bouton est désactivé. */
  protected readonly hint = computed(() => {
    this.formChanged();
    if (!this.form.controls.from.value || !this.form.controls.to.value) {
      return 'Choisis le départ et l’arrivée dans les suggestions.';
    }
    if (this.form.hasError('samePlace')) {
      return 'Le départ et l’arrivée sont identiques.';
    }
    if (this.form.hasError('missingWhen')) {
      return 'Indique la date et l’heure de départ.';
    }
    return '';
  });

  protected readonly journeys = signal<Journey[]>([]);
  protected readonly carCo2 = signal<Co2Emission | undefined>(undefined);
  protected readonly errorMessage = signal('');
  /** Libellés de la dernière recherche, pour le titre des résultats. */
  protected readonly lastSearch = signal<{ from: string; to: string } | null>(null);

  constructor() {
    effect(() => {
      const from = this.from();
      const fromLabel = this.fromLabel();
      const to = this.to();
      const toLabel = this.toLabel();
      const datetime = this.datetime();
      untracked(() => this.restoreFromUrl(from, fromLabel, to, toLabel, datetime));
    });

    this.requests
      .pipe(
        tap(() => {
          this.status.set('loading');
          this.errorMessage.set('');
        }),
        // Une nouvelle recherche annule la précédente encore en cours.
        switchMap((request) =>
          this.api.getJourneys(request.from, request.to, { datetime: request.datetime }).pipe(
            map((response): SearchOutcome => ({ request, response })),
            catchError((error: unknown) => of<SearchOutcome>({ request, error })),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((outcome) => this.show(outcome));
  }

  protected submit(): void {
    if (this.form.invalid) {
      return;
    }
    const { from, to, now, when } = this.form.getRawValue();
    if (!from || !to) {
      return;
    }
    const datetime = now ? undefined : toNavitiaDateTime(when);

    const sameUrl =
      from.id === this.from() && to.id === this.to() && (datetime ?? null) === (this.datetime() ?? null);
    if (sameUrl) {
      // L'URL ne change pas, donc rien ne se déclencherait : on relance la recherche à la main.
      this.requests.next({ from: from.id, fromLabel: from.name, to: to.id, toLabel: to.name, datetime });
      return;
    }
    void this.router.navigate(['/itineraire'], {
      queryParams: { from: from.id, fromLabel: from.name, to: to.id, toLabel: to.name, datetime: datetime ?? null },
    });
  }

  private restoreFromUrl(
    from: string | undefined,
    fromLabel: string | undefined,
    to: string | undefined,
    toLabel: string | undefined,
    datetime: string | undefined,
  ): void {
    if (!from || !to) {
      this.status.set('idle');
      this.journeys.set([]);
      this.lastSearch.set(null);
      return;
    }
    const fromPlace = placeFromUrl(from, fromLabel);
    const toPlace = placeFromUrl(to, toLabel);
    const when = datetime ? navitiaToInputValue(datetime) : '';
    this.form.patchValue({
      from: fromPlace,
      to: toPlace,
      now: !datetime,
      ...(when ? { when } : {}),
    });
    this.requests.next({ from, fromLabel: fromPlace.name, to, toLabel: toPlace.name, datetime });
  }

  private show(outcome: SearchOutcome): void {
    this.lastSearch.set({ from: outcome.request.fromLabel, to: outcome.request.toLabel });
    if ('error' in outcome) {
      this.journeys.set([]);
      this.carCo2.set(undefined);
      this.status.set('error');
      this.errorMessage.set(
        outcome.error instanceof Error ? outcome.error.message : 'Le calcul de l’itinéraire a échoué.',
      );
      return;
    }
    this.journeys.set(outcome.response.journeys ?? []);
    this.carCo2.set(outcome.response.context?.car_direct_path?.co2_emission);
    this.status.set('done');
  }
}
