import { Component, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, map, of, switchMap, tap } from 'rxjs';
import { Place, placeTypeLabel } from '../../models/lieux.models';
import { LieuxApi } from '../../services/lieux-api';

/** Nombre de caractères à partir duquel on interroge l'API. */
const MIN_CHARS = 3;
/** Attente après la dernière frappe : évite une requête par lettre (quota de 1 000 par jour). */
const DEBOUNCE_MS = 350;

let nextId = 0;

type SearchStatus = 'idle' | 'loading' | 'done' | 'error';
/** Résultat d'une recherche ; `null` quand la saisie est trop courte pour chercher. */
type SearchOutcome = { places: Place[] } | { error: unknown } | null;

/**
 * Champ de recherche de lieu avec suggestions (autocomplétion), réutilisable partout où l'on
 * choisit un lieu : départ et arrivée d'un itinéraire, arrêt à ajouter aux favoris…
 *
 * Accessible : motif ARIA « combobox » (flèches, Entrée et Échap au clavier).
 */
@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-lieux-recherche',
  styleUrl: './lieux-recherche.scss',
  templateUrl: './lieux-recherche.html',
})
export class LieuxRecherche {
  readonly label = input.required<string>();
  readonly placeholder = input('Adresse, arrêt ou gare');
  /** Émis quand l'utilisateur choisit une suggestion. */
  readonly placeSelected = output<Place>();

  private readonly api = inject(LieuxApi);

  protected readonly inputId = `lieux-recherche-${nextId++}`;
  protected readonly listId = `${this.inputId}-liste`;
  protected readonly statusId = `${this.inputId}-statut`;
  protected readonly minChars = MIN_CHARS;
  protected readonly typeLabel = placeTypeLabel;

  protected readonly query = new FormControl('', { nonNullable: true });
  protected readonly places = signal<Place[]>([]);
  protected readonly status = signal<SearchStatus>('idle');
  protected readonly errorMessage = signal('');
  /** Dernière recherche terminée, pour le message « Aucun lieu trouvé pour … ». */
  protected readonly lastQuery = signal('');
  protected readonly activeIndex = signal(-1);
  protected readonly open = signal(false);

  protected readonly listVisible = computed(() => this.open() && this.places().length > 0);
  protected readonly activeOptionId = computed(() =>
    this.listVisible() && this.activeIndex() >= 0 ? this.optionId(this.activeIndex()) : null,
  );

  constructor() {
    this.query.valueChanges
      .pipe(
        debounceTime(DEBOUNCE_MS),
        map((value) => value.trim()),
        tap((q) => {
          if (q.length >= MIN_CHARS) {
            this.status.set('loading');
          }
        }),
        // Même une saisie trop courte passe dans switchMap : elle annule la requête en cours,
        // dont la réponse (périmée) ne doit plus s'afficher.
        switchMap((q) => (q.length < MIN_CHARS ? of({ q, outcome: null }) : this.search(q))),
        takeUntilDestroyed(),
      )
      .subscribe(({ q, outcome }) => this.show(q, outcome));
  }

  protected optionId(index: number): string {
    return `${this.listId}-${index}`;
  }

  /** `mousedown` plutôt que `click` : le champ garde le focus et ne se ferme pas avant le choix. */
  protected select(place: Place, event?: Event): void {
    event?.preventDefault();
    // `emitEvent: false` : remplir le champ avec le nom choisi ne relance pas de recherche.
    this.query.setValue(place.name, { emitEvent: false });
    this.open.set(false);
    this.activeIndex.set(-1);
    this.placeSelected.emit(place);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.places().length;
    switch (event.key) {
      case 'ArrowDown':
        if (count > 0) {
          event.preventDefault();
          this.open.set(true);
          this.activeIndex.set((this.activeIndex() + 1) % count);
        }
        break;
      case 'ArrowUp':
        if (count > 0) {
          event.preventDefault();
          this.open.set(true);
          this.activeIndex.set(this.activeIndex() <= 0 ? count - 1 : this.activeIndex() - 1);
        }
        break;
      case 'Enter':
        if (this.listVisible() && this.activeIndex() >= 0) {
          event.preventDefault();
          this.select(this.places()[this.activeIndex()]);
        }
        break;
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.open.set(false);
        }
        break;
    }
  }

  protected reopen(): void {
    if (this.status() === 'done' && this.places().length > 0) {
      this.open.set(true);
    }
  }

  protected close(): void {
    this.open.set(false);
  }

  private search(q: string) {
    return this.api.searchPlaces(q).pipe(
      map((response): SearchOutcome => ({ places: response.places ?? [] })),
      // L'erreur devient une valeur : sans cela, elle terminerait tout le flux de saisie.
      catchError((error: unknown) => of<SearchOutcome>({ error })),
      map((outcome) => ({ q, outcome })),
    );
  }

  private show(q: string, outcome: SearchOutcome): void {
    this.activeIndex.set(-1);
    if (outcome === null) {
      this.places.set([]);
      this.status.set('idle');
      this.errorMessage.set('');
      this.open.set(false);
      return;
    }
    this.lastQuery.set(q);
    if ('error' in outcome) {
      this.places.set([]);
      this.status.set('error');
      this.errorMessage.set(
        outcome.error instanceof Error ? outcome.error.message : 'La recherche a échoué.',
      );
      this.open.set(false);
      return;
    }
    this.places.set(outcome.places);
    this.status.set('done');
    this.errorMessage.set('');
    this.open.set(outcome.places.length > 0);
  }
}
