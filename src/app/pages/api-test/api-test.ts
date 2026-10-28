import { JsonPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, finalize } from 'rxjs';
import { PrimApiService, TrafficOptions } from '../../core/prim-api.service';
import { PrimUsageService } from '../../core/prim-usage.service';
import { isElevatorOutage } from '../../core/prim-traffic';

interface CallLog {
  id: number;
  label: string;
  ok: boolean;
  durationMs: number;
  summary: string;
  raw: unknown;
}

/**
 * Bac à sable pour vérifier que chaque API PRIM répond, et voir la vraie forme des réponses
 * avant de construire les écrans. Chaque bouton envoie UNE requête (pas d'appel automatique),
 * pour ne pas gaspiller le quota de 1 000 requêtes par jour.
 */
@Component({
  selector: 'app-api-test',
  imports: [FormsModule, JsonPipe],
  templateUrl: './api-test.html',
  styleUrl: './api-test.scss',
})
export class ApiTest {
  private readonly api = inject(PrimApiService);
  protected readonly usage = inject(PrimUsageService);

  protected readonly placeQuery = signal('chatelet');
  // Châtelet → Gare de Lyon, en `longitude;latitude`.
  protected readonly journeyFrom = signal('2.3470;48.8584');
  protected readonly journeyTo = signal('2.3736;48.8443');
  // Mode des infos trafic : un id Navitia, `sans-bus` ou `tout` (5 premières lignes, surtout des bus).
  protected readonly trafficMode = signal('physical_mode:Metro');
  // Zone de correspondance Châtelet.
  protected readonly monitoringRef = signal('STIF:StopArea:SP:71264:');

  protected readonly logs = signal<CallLog[]>([]);
  protected readonly loading = signal(false);
  protected readonly copyStatus = signal<{ id: number; status: 'copied' | 'failed' } | null>(null);
  private nextId = 1;

  protected searchPlaces(): void {
    this.run(`Lieux « ${this.placeQuery()} »`, this.api.searchPlaces(this.placeQuery()), (r) => {
      const names = (r.places ?? []).map((p) => `${p.name} (${p.embedded_type})`);
      return `${names.length} lieu(x) : ${names.join(' · ')}`;
    });
  }

  protected getJourneys(): void {
    this.run(
      `Itinéraire ${this.journeyFrom()} → ${this.journeyTo()}`,
      this.api.getJourneys(this.journeyFrom(), this.journeyTo()),
      (r) => {
        const journeys = r.journeys ?? [];
        const first = journeys[0];
        if (!first) {
          return 'Aucun trajet trouvé';
        }
        const minutes = Math.round(first.duration / 60);
        return `${journeys.length} trajet(s) · le 1er : ${minutes} min, ${first.nb_transfers} correspondance(s), ${first.sections.length} étapes`;
      },
    );
  }

  protected getTraffic(): void {
    const mode = this.trafficMode();
    const options: TrafficOptions =
      mode === 'tout'
        ? { count: 5 }
        : mode === 'sans-bus'
          ? { count: 20, excludeModes: ['physical_mode:Bus'] }
          : { count: 20, physicalMode: mode };

    this.run(`Infos trafic (${mode})`, this.api.getTrafficReports(options), (r) => {
      const lines = r.line_reports ?? [];
      const disruptions = r.disruptions ?? [];
      const total = r.pagination?.total_result;
      const active = disruptions.filter((d) => d.status === 'active').length;
      const lifts = disruptions.filter(isElevatorOutage).length;
      const modes = new Set(lines.flatMap((l) => (l.line.physical_modes ?? []).map((m) => m.id)));
      return (
        `${lines.length} ligne(s)${total ? ` sur ${total}` : ''} : ${lines.map((l) => l.line.code ?? l.line.name).join(', ') || 'aucune'}` +
        ` · modes : ${[...modes].join(', ') || '?'}` +
        ` · ${disruptions.length} perturbation(s) sur la page (${active} en cours, ${lifts} pannes d'ascenseur)`
      );
    });
  }

  protected getDepartures(): void {
    this.run(`Prochains passages ${this.monitoringRef()}`, this.api.getNextDepartures(this.monitoringRef()), (r) => {
      const visits = r.Siri?.ServiceDelivery?.StopMonitoringDelivery?.[0]?.MonitoredStopVisit ?? [];
      const next = visits[0]?.MonitoredVehicleJourney;
      const prochain = next
        ? ` · prochain : ${next.DestinationName?.[0]?.value ?? '?'} à ${next.MonitoredCall?.ExpectedDepartureTime ?? next.MonitoredCall?.ExpectedArrivalTime ?? '?'}`
        : '';
      return `${visits.length} passage(s)${prochain}`;
    });
  }

  protected clearLogs(): void {
    this.logs.set([]);
  }

  /** Copie la réponse brute (JSON indenté) dans le presse-papiers. */
  protected async copyRaw(log: CallLog): Promise<void> {
    let status: 'copied' | 'failed' = 'copied';
    try {
      await navigator.clipboard.writeText(JSON.stringify(log.raw, null, 2));
    } catch {
      status = 'failed';
    }
    this.copyStatus.set({ id: log.id, status });
    setTimeout(() => this.copyStatus.set(null), 1800);
  }

  private run<T>(label: string, request$: Observable<T>, summarize: (response: T) => string): void {
    const start = performance.now();
    this.loading.set(true);
    request$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (raw) => this.addLog({ label, ok: true, summary: summarize(raw), raw }, start),
      error: (error: unknown) =>
        this.addLog(
          {
            label,
            ok: false,
            summary: this.describeError(error),
            raw: error instanceof HttpErrorResponse ? error.error : null,
          },
          start,
        ),
    });
  }

  private addLog(entry: Omit<CallLog, 'id' | 'durationMs'>, start: number): void {
    const log: CallLog = { ...entry, id: this.nextId++, durationMs: Math.round(performance.now() - start) };
    this.logs.update((logs) => [log, ...logs]);
  }

  private describeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          return 'Pas de réponse : réseau coupé ou blocage CORS';
        case 401:
          return 'Clé API refusée (401) : vérifie PRIM_API_KEY dans .env';
        case 429:
          return 'Quota dépassé (429) : trop de requêtes, attends ou demande plus de quota';
        default:
          return `Erreur HTTP ${error.status} ${error.statusText}`;
      }
    }
    return error instanceof Error ? error.message : 'Erreur inconnue';
  }
}
