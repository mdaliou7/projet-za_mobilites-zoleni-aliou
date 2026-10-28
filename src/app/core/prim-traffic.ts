import { Disruption } from './prim.models';

/** Titre court d'une perturbation (canal `titre`), ex. « Panne d'un ascenseur ». */
export function disruptionTitle(disruption: Disruption): string | undefined {
  return disruption.messages?.find((m) => m.channel?.name === 'titre')?.text;
}

/** Message détaillé (canal `moteur`) : du HTML, à afficher avec `[innerHTML]`. */
export function disruptionBody(disruption: Disruption): string | undefined {
  return disruption.messages?.find((m) => m.channel?.name === 'moteur')?.text;
}

/**
 * Une panne d'ascenseur est une perturbation comme les autres, mais elle porte des canaux
 * `email ascenseur` / `sms ascenseurs` (constaté sur les réponses réelles du 2026-10-28).
 * Elle touche une zone d'arrêts (`stop_area`) : base du trajet accessible.
 */
export function isElevatorOutage(disruption: Disruption): boolean {
  return (disruption.messages ?? []).some((m) => /ascenseur/i.test(m.channel?.name ?? ''));
}

/** Identifiants des zones d'arrêts touchées par une perturbation (`stop_area:IDFM:65063`…). */
export function impactedStopAreaIds(disruption: Disruption): string[] {
  return (disruption.impacted_objects ?? [])
    .map((o) => o.pt_object)
    .filter((p) => p.embedded_type === 'stop_area')
    .map((p) => p.id);
}
