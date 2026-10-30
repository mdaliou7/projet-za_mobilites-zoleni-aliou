import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PRIM_LINE_REPORTS_URL } from '../config/prim.config';
import { LineReportsResponse, TrafficOptions } from '../models/trafic.models';

/** Infos trafic : perturbations par ligne, par mode ou sur tout le réseau (API Messages Info Trafic). */
@Service()
export class TraficApi {
  private readonly http = inject(HttpClient);

  /**
   * Max 100 lignes par page. Sans filtre, l'API renvoie les lignes dans l'ordre de ses
   * identifiants (surtout des bus) : pour le métro, le RER ou le tramway, il faut filtrer par mode
   * (`physicalMode`).
   */
  getTrafficReports(options: TrafficOptions = {}): Observable<LineReportsResponse> {
    let params = new HttpParams().set('count', options.count ?? 5);
    if (options.startPage) {
      params = params.set('start_page', options.startPage);
    }
    for (const mode of options.excludeModes ?? []) {
      params = params.append('forbidden_uris[]', mode);
    }
    return this.http.get<LineReportsResponse>(`${this.baseUrl(options)}/line_reports`, { params });
  }

  /** Les filtres par mode ou par ligne s'insèrent dans le chemin : `…/{collection}/{id}/line_reports`. */
  private baseUrl({ physicalMode, lineId }: TrafficOptions): string {
    if (physicalMode) {
      return `${PRIM_LINE_REPORTS_URL}/physical_modes/${encodeURIComponent(physicalMode)}`;
    }
    if (lineId) {
      return `${PRIM_LINE_REPORTS_URL}/lines/${encodeURIComponent(lineId)}`;
    }
    return PRIM_LINE_REPORTS_URL;
  }
}
