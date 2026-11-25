import { Component, computed, input } from '@angular/core';

const FALLBACK_BACKGROUND = '#5b6676';
const HEX_COLOR = /^[0-9a-f]{6}$/i;

/** `FFBE00` → `#FFBE00` ; toute valeur qui n'est pas un hexadécimal à 6 chiffres est refusée. */
function toCssColor(value: string | undefined): string | undefined {
  return value && HEX_COLOR.test(value) ? `#${value}` : undefined;
}

/** Noir ou blanc, selon la luminosité du fond, quand l'API ne donne pas de couleur de texte. */
function readableTextOn(background: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(background.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#000000' : '#ffffff';
}

/**
 * Pastille d'une ligne (« 14 », « RER E »…) avec les couleurs officielles renvoyées par PRIM.
 * Réutilisée par l'itinéraire, les horaires et le trafic.
 */
@Component({
  selector: 'app-line-badge',
  styleUrl: './line-badge.scss',
  templateUrl: './line-badge.html',
})
export class LineBadge {
  readonly label = input.required<string>();
  /** Fond en hexadécimal sans `#` (ex. `FFBE00`), comme l'API le renvoie. */
  readonly color = input<string | undefined>();
  readonly textColor = input<string | undefined>();

  protected readonly background = computed(() => toCssColor(this.color()) ?? FALLBACK_BACKGROUND);
  protected readonly foreground = computed(
    () => toCssColor(this.textColor()) ?? readableTextOn(this.background()),
  );
}
