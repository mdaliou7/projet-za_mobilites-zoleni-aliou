import { Component, computed, input } from '@angular/core';
import {
  Co2Emission,
  Journey,
  JourneySection,
  formatCo2,
  formatDuration,
  formatNavitiaTime,
  publicTransportSections,
} from '../../models/itineraire.models';
import { LineBadge } from '../line-badge/line-badge';

const MODE_LABELS: Record<string, string> = {
  walking: 'Marcher',
  bike: 'Vélo',
  car: 'Voiture',
  taxi: 'Taxi',
};

/**
 * Un trajet proposé par le calculateur : résumé sur une ligne (heures, durée, correspondances,
 * lignes empruntées), puis liste dépliable des étapes et empreinte carbone.
 */
@Component({
  imports: [LineBadge],
  selector: 'app-trajet-detail',
  styleUrl: './trajet-detail.scss',
  templateUrl: './trajet-detail.html',
})
export class TrajetDetail {
  readonly journey = input.required<Journey>();
  /** Émission d'un trajet équivalent en voiture, pour comparer (renvoyée une fois par réponse). */
  readonly carCo2 = input<Co2Emission | undefined>();
  /** Détail déplié au départ. */
  readonly open = input(false);

  protected readonly departure = computed(() => formatNavitiaTime(this.journey().departure_date_time));
  protected readonly arrival = computed(() => formatNavitiaTime(this.journey().arrival_date_time));
  protected readonly duration = computed(() => formatDuration(this.journey().duration));
  protected readonly lines = computed(() => publicTransportSections(this.journey()));

  protected readonly transfers = computed(() => {
    const n = this.journey().nb_transfers;
    return n === 0 ? 'Direct' : n === 1 ? '1 correspondance' : `${n} correspondances`;
  });

  protected readonly co2 = computed(() => {
    const own = this.journey().co2_emission;
    if (!own) {
      return null;
    }
    const car = this.carCo2();
    return { own: formatCo2(own.value), car: car ? formatCo2(car.value) : null };
  });

  /**
   * `crow_fly` (marche « à vol d'oiseau » depuis ou vers un arrêt, vu en réel) s'affiche comme de la
   * marche ordinaire.
   */
  protected stepKind(section: JourneySection): string {
    return section.type === 'crow_fly' ? 'street_network' : section.type;
  }

  /** Affiche « de A à B » seulement quand A et B existent et diffèrent (une étape `crow_fly` a le même lieu des deux côtés). */
  protected hasDistinctPlaces(section: JourneySection): boolean {
    const from = section.from?.name;
    const to = section.to?.name;
    return !!from && !!to && from !== to;
  }

  protected lineLabel(section: JourneySection): string {
    const info = section.display_informations;
    return info?.label ?? info?.code ?? '?';
  }

  protected modeLabel(mode: string | undefined): string {
    return (mode && MODE_LABELS[mode]) ?? 'Se déplacer';
  }

  protected time(dateTime: string | undefined): string {
    return formatNavitiaTime(dateTime);
  }

  protected sectionDuration(section: JourneySection): string {
    return formatDuration(section.duration);
  }
}
